import { Record } from '@abw/badger-database'

export class User extends Record {
  async placeOrder(details) {
    const orders = await this.database.table('orders');
    return await orders.placeOrder({
      ...details, customer_id: this.row.id
    })
  }
}

export default User