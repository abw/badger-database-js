export const queries  = {
  dropCompaniesTable:  'DROP TABLE IF EXISTS companies',
  dropOrdersTable:     'DROP TABLE IF EXISTS orders',
  dropOrderItemsTable: 'DROP TABLE IF EXISTS order_items',
  dropProductsTable:   'DROP TABLE IF EXISTS products',
  dropUsersTable:      'DROP TABLE IF EXISTS users',
  createCompaniesTable: `
    CREATE TABLE companies (
      id          INTEGER,
      name        TEXT,
      PRIMARY KEY (id ASC)
    )`,
  createOrdersTable: `
    CREATE TABLE orders (
      id          INTEGER,
      customer_id TEXT,
      placed      TEXT,
      total       REAL,
      PRIMARY KEY (id ASC)
  )`,
  createOrderItemsTable: `
    CREATE TABLE order_items (
      id          INTEGER,
      order_id    INTEGER,
      product_id  INTEGER,
      quantity    INTEGER,
      price       REAL,
      total       REAL,
      PRIMARY KEY (id ASC),
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
  )`,
  createUsersTable: `
    CREATE TABLE users (
      id          INTEGER,
      company_id  INTEGER,
      name        TEXT,
      email       TEXT,
      telephone   TEXT,
      PRIMARY KEY (id ASC),
      FOREIGN KEY (company_id) REFERENCES companies(id)
  )`,
  createProductsTable: `
    CREATE TABLE products (
      id           INTEGER,
      supplier_id  INTEGER,
      name         TEXT,
      price        REAL,
      PRIMARY KEY (id ASC),
      FOREIGN KEY (supplier_id) REFERENCES companies(id)
    )`,
};

export default queries