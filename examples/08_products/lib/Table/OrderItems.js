import { Table, sql } from '@abw/badger-database'

export class OrderItems extends Table {
  configure(schema) {
    schema.columns = 'id order_id product_id quantity price total',
    schema.queries = {
      orderItems: t => t.select()
        .select('products.name')
        .join('product_id = products.id')
        .where('order_id'),
      orderTotal: t => t
        .select([sql`SUM(total)`, 'order_total'])
        .where('order_id')
    },
    schema.relations = {
      order:   'order_id -> orders.id',
      product: 'product_id -> products.id',
    }
  }

  async orderItems(order_id) {
    return await this.allRecords('orderItems', [order_id])
  }

  async orderTotal(order_id) {
    const row = await this.any('orderTotal', [order_id]);
    return row.order_total;
  }
}

export default OrderItems