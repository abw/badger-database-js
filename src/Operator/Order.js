import Operator from '../Operator.js';

export class Order extends Operator {
  initOperator() {
    this.key = 'order';
  }
}

export default Order