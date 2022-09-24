import Operator from '../Operator.js';

export class After extends Operator {
  initOperator() {
    this.key = 'after';
  }
}

export default After