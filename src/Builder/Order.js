import Builder from '../Builder.js';

export class Order extends Builder {
  initBuilder() {
    this.key = 'order';
  }
}

export default Order