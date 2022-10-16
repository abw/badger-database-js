import { Table } from '@abw/badger-database'
import Order from '../Record/Order.js';

export class Orders extends Table {
  configure(schema) {
    schema.recordClass = Order
    schema.columns = 'id customer_id placed total'
    schema.relations = {
      customer: 'customer_id -> users.id',
      items: {
        load: async order => {
          const items = await order.database.table('order_items');
          return await items.orderItems(order.row.id)
        }
      }
    }
  }

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

export default Orders