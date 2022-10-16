import { Record } from '@abw/badger-database'

export class Order extends Record {
  async addItem(item) {
    const products = await this.database.table('products');
    const items    = await this.database.table('order_items');
    const product  = await products.fetchOne({ id: item.product_id });
    return await items.insert({
      ...item,
      order_id: this.row.id,
      price: product.price,
      total: (product.price * item.quantity).toFixed(2),
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

export default Order