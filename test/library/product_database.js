import { expect, test } from 'vitest'
import { connect, Record, sql, Table } from "../../src/index.js"
import { databaseConfig } from './database.js'
import { pass } from './expect.js'

class Orders extends Table {
  async placeOrder(details) {
    const orders = await this.database.table('orders')
    const order  = await orders.insertRecord({
      customer_id: details.customer_id,
      placed:      details.placed,
    })
    if (details.items) {
      for (let item of details.items) {
        await order.addItem(item)
      }
      await order.updateTotalPrice()
    }
    return order
  }
}

class OrderItems extends Table {
  async orderItems(order_id) {
    return await this.allRecords('orderItems', [order_id])
  }
  async orderTotal(order_id) {
    const row = await this.any('orderTotal', [order_id])
    return row.order_total;
  }
}

class Order extends Record {
  async addItem(item) {
    const products = await this.database.table('products')
    const items    = await this.database.table('order_items')
    const product  = await products.fetchOne({ id: item.product_id })
    return await items.insert({
      ...item,
      order_id: this.row.id,
      price: product.price,
      total: product.price * item.quantity,
    })
  }
  async calculateTotalPrice() {
    const items = await this.database.table('order_items')
    return await items.orderTotal(this.row.id)
  }
  async updateTotalPrice() {
    const total = await this.calculateTotalPrice()
    return await this.update({ total: total })
  }
}

class User extends Record {
  async placeOrder(details) {
    const orders = await this.database.table('orders')
    return await orders.placeOrder({
      ...details, customer_id: this.row.id
    })
  }
}

//-----------------------------------------------------------------------------
// Connect to database and setup tables
//-----------------------------------------------------------------------------
export function connectProductDatabase(engine='sqlite') {
  const database = databaseConfig(engine)
  const sqlite   = engine === 'sqlite'
  const mysql    = engine === 'mysql'
  const serial   = sqlite ? 'INTEGER' : 'SERIAL'
  const asc      = sqlite ? ' ASC' : ''
  const reftype  = mysql  ? 'BIGINT UNSIGNED NOT NULL' : 'INTEGER'
  const anyref   = mysql  ? 'BIGINT UNSIGNED NULL' : 'INTEGER'
  const queries  = {
    dropCompaniesTable:  'DROP TABLE IF EXISTS companies',
    dropOrdersTable:     'DROP TABLE IF EXISTS orders',
    dropOrderItemsTable: 'DROP TABLE IF EXISTS order_items',
    dropProductsTable:   'DROP TABLE IF EXISTS products',
    dropUsersTable:      'DROP TABLE IF EXISTS users',
    createCompaniesTable: `
      CREATE TABLE companies (
        id        ${serial},
        name      TEXT,
        PRIMARY KEY (id${asc})
      )`,
    createOrdersTable: `
      CREATE TABLE orders (
        id          ${serial},
        customer_id ${reftype},
        placed      TEXT,
        total       REAL,
        PRIMARY KEY (id${asc})
    )`,
    createOrderItemsTable: `
      CREATE TABLE order_items (
        id          ${serial},
        order_id    ${reftype},
        product_id  ${reftype},
        quantity    INTEGER,
        price       REAL,
        total       REAL,
        PRIMARY KEY (id${asc}),
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    )`,
    createUsersTable: `
      CREATE TABLE users (
        id          ${serial},
        company_id  ${anyref},
        name        TEXT,
        email       TEXT,
        telephone   TEXT,
        PRIMARY KEY (id${asc}),
        FOREIGN KEY (company_id) REFERENCES companies(id)
    )`,
    createProductsTable: `
      CREATE TABLE products (
        id           ${serial},
        supplier_id  ${reftype},
        name         TEXT,
        price        REAL,
        PRIMARY KEY (id${asc}),
        FOREIGN KEY (supplier_id) REFERENCES companies(id)
      )`,
  };
  const companies = {
    columns: 'id name',
  };
  const orders = {
    columns: 'id customer_id placed total',
    relations: {
      customer: 'customer_id -> users.id',
      items: {
        load: async order => {
          const items = await order.database.table('order_items');
          return await items.orderItems(order.row.id)
        }
      }
    },
    tableClass: Orders,
    recordClass: Order
  };
  const order_items = {
    columns: 'id order_id product_id quantity price total',
    queries: {
      orderItems: t => t.select()
        .select('products.name')
        .join('product_id = products.id')
        .where('order_id'),
      orderTotal: t => t
        .select([sql`SUM(total)`, 'order_total'])
        .where('order_id')
    },
    relations: {
      order:   'order_id -> orders.id',
      product: 'product_id -> products.id',
    },
    tableClass: OrderItems,
  };
  const users = {
    columns: 'id company_id name email',
    recordClass: User,
    relations: {
      company: 'company_id ~> companies.id',
    },
  };
  const products = {
    columns: 'id supplier_id name price',
  };
  const tables = {
    companies, orders, order_items, users, products
  };

  return connect({
    database, tables, queries
  });
}

export async function createProductDatabaseTables(db) {
  await db.run('createCompaniesTable');
  await db.run('createUsersTable');
  await db.run('createProductsTable');
  await db.run('createOrdersTable');
  await db.run('createOrderItemsTable');
}

export async function dropProductDatabaseTables(db) {
  await db.run('dropOrderItemsTable');
  await db.run('dropOrdersTable');
  await db.run('dropProductsTable');
  await db.run('dropUsersTable');
  await db.run('dropCompaniesTable');
}

export async function runProductDatabaseTests(engine='sqlite') {
  const db         = connectProductDatabase(engine)
  const companies  = await db.table('companies')
  const users      = await db.table('users')
  const products   = await db.table('products')
  let BadgersInc, FerretsLtd, StoatsRUs;
  let Bobby, Brian, Frank, Fiona, Simon, Susan, Terry;
  let Frock, Furs, Socks, Shoes;

  test( 'drop existing tables',
    async () => {
      await dropProductDatabaseTables(db)
      pass()
    }
  )

  test( 'create tables',
    async () => {
      await createProductDatabaseTables(db);
      pass()
    }
  )

  test( 'insert companies',
    async () => {
      [BadgersInc, FerretsLtd, StoatsRUs] = await companies.insertRecords([
        { name: 'Badgers Inc.' },
        { name: 'Ferrets Ltd.' },
        { name: 'Stoats R Us'  },
      ]);
      expect(BadgersInc.name).toBe('Badgers Inc.')
      expect(FerretsLtd.name).toBe('Ferrets Ltd.')
      expect(StoatsRUs.name).toBe('Stoats R Us')
    }
  )

  test( 'insert users',
    async () => {
      [Bobby, Brian, Frank, Fiona, Simon, Susan, Terry] = await users.insertRecords([
        { name: 'Bobby Badger', company_id: BadgersInc.id },
        { name: 'Brian Badger', company_id: BadgersInc.id },
        { name: 'Frank Ferret', company_id: FerretsLtd.id },
        { name: 'Fiona Ferret', company_id: FerretsLtd.id },
        { name: 'Simon Stoat',  company_id: StoatsRUs.id  },
        { name: 'Susan Stoat',  company_id: StoatsRUs.id  },
        { name: 'Terry Turtle' },
      ]);
      expect(Bobby.name).toBe('Bobby Badger')
      expect(Brian.name).toBe('Brian Badger')
      expect(Frank.name).toBe('Frank Ferret')
      expect(Fiona.name).toBe('Fiona Ferret')
      expect(Simon.name).toBe('Simon Stoat' )
      expect(Susan.name).toBe('Susan Stoat' )
    }
  )

  test( 'insert products',
    async () => {
      [Frock, Furs, Socks, Shoes] = await products.insertRecords([
        { name: 'Ferret Frock', price:  49.99, supplier_id: FerretsLtd.id },
        { name: 'Ferret Furs',  price: 159.99, supplier_id: FerretsLtd.id },
        { name: 'Stoaty Socks', price:   4.99, supplier_id: StoatsRUs.id },
        { name: 'Stoaty Shoes', price:  32.99, supplier_id: StoatsRUs.id },
      ]);
      expect(Frock.name).toBe('Ferret Frock')
      expect(Furs.name).toBe('Ferret Furs')
      expect(Socks.name).toBe('Stoaty Socks')
      expect(Shoes.name).toBe('Stoaty Shoes')
    }
  )

  test( 'place order',
    async () => {
      const order = await Bobby.placeOrder({
        placed: '2022-10-15',
        items: [
          { product_id: Frock.id, quantity: 1 },
          { product_id: Shoes.id, quantity: 2 },
        ]
      });
      expect(order.id).toBe(1)
      expect(order.placed).toBe('2022-10-15')
      const customer = await order.customer
      expect(customer.name).toBe('Bobby Badger')
      const items = await order.items
      expect(items.length).toBe(2)
      expect(items[0].name).toBe('Ferret Frock')
      expect(parseFloat(items[0].price)).toBe(49.99)
      expect(parseFloat(items[0].total)).toBe(49.99)
      expect(items[1].name).toBe('Stoaty Shoes')
      expect(parseFloat(items[1].price)).toBe(32.99)
      expect(parseFloat(items[1].total)).toBe(65.98)
      expect(parseFloat(order.total)).toBe(115.97)
    }
  )

  test( 'place another order',
    async () => {
      const order = await Brian.placeOrder({
        placed: '2022-10-15',
        items: [
          { product_id: Frock.id, quantity: 2 },
          { product_id: Socks.id, quantity: 3 },
          { product_id: Shoes.id, quantity: 1 },
        ]
      })
      expect(order.id).toBe(2)
      expect(order.placed).toBe('2022-10-15')
      const customer = await order.customer
      expect(customer.name).toBe('Brian Badger')
      const items = await order.items
      expect(items.length).toBe(3)
      expect(items[0].name).toBe('Ferret Frock')
      expect(parseFloat(items[0].price)).toBe(49.99)
      expect(parseFloat(items[0].total)).toBe(99.98)
      expect(items[1].name).toBe('Stoaty Socks')
      expect(parseFloat(items[1].price)).toBe(4.99)
      expect(parseFloat(items[1].total)).toBe(14.97)
      expect(items[2].name).toBe('Stoaty Shoes')
      expect(parseFloat(items[2].price)).toBe(32.99)
      expect(parseFloat(items[2].total)).toBe(32.99)
      expect(parseFloat(order.total)).toBe(147.94)
    }
  )

  test( 'Bobby has a company...',
    async () => {
      const company = await Bobby.company
      expect(company.name).toBe(BadgersInc.name)
    }
  );
  test( "...but Terry doesn't",
    async () => {
      const company = await Terry.company
      expect(company).toBe(undefined)
    }
  );

  test( 'drop tables',
    async () => {
      await dropProductDatabaseTables(db)
      pass()
    }
  )
}