import { Table, sql } from '@abw/badger-database'

export class Products extends Table {
  configure(schema) {
    schema.columns = 'id supplier_id name price';
    schema.queries = {
      salesFigures: t => t.select()
        .select([sql`SUM(order_items.quantity)`, 'total_sold'])
        .select([sql`SUM(order_items.quantity * products.price)`, 'total_revenue'])
        .join('products.id => order_items.product_id')
        .group('product_id')
        .order(['total_revenue', 'DESC'])
    }
  }
  async salesFigures() {
    return await this.all('salesFigures');
  }
}

export default Products
