import connect from '@abw/badger-database'
import Queries from './Database/Queries.js';
import Companies from './Table/Companies.js';
import Orders from './Table/Orders.js';
import OrderItems from './Table/OrderItems.js';
import Users from './Table/Users.js';
import Products from './Table/Products.js';

export const connectProducts = async () => {
  const db = connect({
    database: 'sqlite:memory',
    queries: Queries,
    tables: {
      companies:    Companies,
      orders:       Orders,
      order_items:  OrderItems,
      users:        Users,
      products:     Products,
    },
  })

  await db.run('createCompaniesTable');
  await db.run('createUsersTable');
  await db.run('createProductsTable');
  await db.run('createOrdersTable');
  await db.run('createOrderItemsTable');

  return db;
}

export default connectProducts