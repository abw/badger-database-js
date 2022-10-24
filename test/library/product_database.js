import test from 'ava';
import { connect, Record, sql, Table } from "../../src/index.js";
import { databaseConfig } from './database.js';

class Orders extends Table {
  async placeOrder(details) {
    const orders = await this.database.table('orders');
    const order  = await orders.insertRecord({
      customer_id: details.customer_id,
      placed:      details.placed,
    });
    if (details.items) {
      for (let item of details.items) {
        await order.addItem(item)
      }
      await order.updateTotalPrice()
    }
    return order;
  }
}

class OrderItems extends Table {
  async orderItems(order_id) {
    return await this.allRecords('orderItems', [order_id])
  }
  async orderTotal(order_id) {
    const row = await this.any('orderTotal', [order_id]);
    return row.order_total;
  }
}

class Order extends Record {
  async addItem(item) {
    const products = await this.database.table('products');
    const items    = await this.database.table('order_items');
    const product  = await products.fetchOne({ id: item.product_id });
    return await items.insert({
      ...item,
      order_id: this.row.id,
      price: product.price,
      total: product.price * item.quantity,
    });
  }
  async calculateTotalPrice() {
    const items = await this.database.table('order_items');
    return await items.orderTotal(this.row.id);
  }
  async updateTotalPrice() {
    const total = await this.calculateTotalPrice();
    return await this.update({ total: total });
  }
}

class User extends Record {
  async placeOrder(details) {
    const orders = await this.database.table('orders');
    return await orders.placeOrder({
      ...details, customer_id: this.row.id
    })
  }
}

//-----------------------------------------------------------------------------
// Connect to database and setup tables
//-----------------------------------------------------------------------------
export function connectProductDatabase(engine='sqlite') {
  const database = databaseConfig(engine);
  const sqlite   = engine === 'sqlite';
  const mysql    = engine === 'mysql';
  const serial   = sqlite ? 'INTEGER' : 'SERIAL';
  const asc      = sqlite ? ' ASC' : '';
  const reftype  = mysql  ? 'BIGINT UNSIGNED NOT NULL' : 'INTEGER';
  const anyref   = mysql  ? 'BIGINT UNSIGNED NULL' : 'INTEGER';
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
  const db         = connectProductDatabase(engine);
  const companies  = await db.table('companies');
  // const orders     = await db.table('orders');
  // const orderItems = await db.table('order_items');
  const users      = await db.table('users');
  const products   = await db.table('products');
  let BadgersInc, FerretsLtd, StoatsRUs;
  let Bobby, Brian, Frank, Fiona, Simon, Susan, Terry;
  let Frock, Furs, Socks, Shoes;

  test.serial( 'drop existing tables',
    async t => {
      await dropProductDatabaseTables(db);
      t.pass();
    }
  )

  test.serial( 'create tables',
    async t => {
      await createProductDatabaseTables(db);
      t.pass();
    }
  )

  test.serial( 'insert companies',
    async t => {
      [BadgersInc, FerretsLtd, StoatsRUs] = await companies.insertRecords([
        { name: 'Badgers Inc.' },
        { name: 'Ferrets Ltd.' },
        { name: 'Stoats R Us'  },
      ]);
      t.is( BadgersInc.name, 'Badgers Inc.' );
      t.is( FerretsLtd.name, 'Ferrets Ltd.' );
      t.is( StoatsRUs.name, 'Stoats R Us' );
    }
  )

  test.serial( 'insert users',
    async t => {
      [Bobby, Brian, Frank, Fiona, Simon, Susan, Terry] = await users.insertRecords([
        { name: 'Bobby Badger', company_id: BadgersInc.id },
        { name: 'Brian Badger', company_id: BadgersInc.id },
        { name: 'Frank Ferret', company_id: FerretsLtd.id },
        { name: 'Fiona Ferret', company_id: FerretsLtd.id },
        { name: 'Simon Stoat',  company_id: StoatsRUs.id  },
        { name: 'Susan Stoat',  company_id: StoatsRUs.id  },
        { name: 'Terry Turtle' },
      ]);
      t.is( Bobby.name, 'Bobby Badger' );
      t.is( Brian.name, 'Brian Badger' );
      t.is( Frank.name, 'Frank Ferret' );
      t.is( Fiona.name, 'Fiona Ferret' );
      t.is( Simon.name, 'Simon Stoat'  );
      t.is( Susan.name, 'Susan Stoat'  );
    }
  )

  test.serial( 'insert products',
    async t => {
      [Frock, Furs, Socks, Shoes] = await products.insertRecords([
        { name: 'Ferret Frock', price:  49.99, supplier_id: FerretsLtd.id },
        { name: 'Ferret Furs',  price: 159.99, supplier_id: FerretsLtd.id },
        { name: 'Stoaty Socks', price:   4.99, supplier_id: StoatsRUs.id },
        { name: 'Stoaty Shoes', price:  32.99, supplier_id: StoatsRUs.id },
      ]);
      t.is( Frock.name, 'Ferret Frock' )
      t.is( Furs.name,  'Ferret Furs' )
      t.is( Socks.name, 'Stoaty Socks' )
      t.is( Shoes.name, 'Stoaty Shoes' )
    }
  )

  test.serial( 'place order',
    async t => {
      const order = await Bobby.placeOrder({
        placed: '2022-10-15',
        items: [
          { product_id: Frock.id, quantity: 1 },
          { product_id: Shoes.id, quantity: 2 },
        ]
      });
      t.is( order.id, 1 )
      t.is( order.placed, '2022-10-15' )
      const customer = await order.customer;
      t.is( customer.name, 'Bobby Badger' );
      const items = await order.items;
      t.is( items.length, 2 );
      t.is( items[0].name,  'Ferret Frock' );
      t.is( parseFloat(items[0].price), 49.99 );
      t.is( parseFloat(items[0].total), 49.99 );
      t.is( items[1].name,  'Stoaty Shoes' );
      t.is( parseFloat(items[1].price), 32.99 );
      t.is( parseFloat(items[1].total), 65.98 );
      t.is( parseFloat(order.total), 115.97 );
    }
  )

  test.serial( 'place another order',
    async t => {
      const order = await Brian.placeOrder({
        placed: '2022-10-15',
        items: [
          { product_id: Frock.id, quantity: 2 },
          { product_id: Socks.id, quantity: 3 },
          { product_id: Shoes.id, quantity: 1 },
        ]
      });
      t.is( order.id, 2 )
      t.is( order.placed, '2022-10-15' )
      const customer = await order.customer;
      t.is( customer.name, 'Brian Badger' );
      const items = await order.items;
      t.is( items.length, 3 );
      t.is( items[0].name,  'Ferret Frock' );
      t.is( parseFloat(items[0].price), 49.99 );
      t.is( parseFloat(items[0].total), 99.98 );
      t.is( items[1].name,  'Stoaty Socks' );
      t.is( parseFloat(items[1].price), 4.99 );
      t.is( parseFloat(items[1].total), 14.97 );
      t.is( items[2].name,  'Stoaty Shoes' );
      t.is( parseFloat(items[2].price), 32.99 );
      t.is( parseFloat(items[2].total), 32.99 );
      t.is( parseFloat(order.total), 147.94 );
    }
  )

  test.serial( 'Bobby has a company...',
    async t => {
      const company = await Bobby.company;
      t.is( company.name, BadgersInc.name );
    }
  );
  test.serial( "...but Terry doesn't",
    async t => {
      const company = await Terry.company;
      t.is( company, undefined );
    }
  );

  test.after( 'drop tables',
    async t => {
      await dropProductDatabaseTables(db);
      t.pass();
    }
  )
}