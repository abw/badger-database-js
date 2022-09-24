import Operator from '../Operator.js';

export class Before extends Operator {
  initOperator() {
    this.key = 'before';
  }
}

export default Before