import Operator from '../Operator.js';

export class From extends Operator {
  initOperator() {
    this.key = 'from';
  }
}

export default From