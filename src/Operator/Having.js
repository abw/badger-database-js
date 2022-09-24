import Operator from '../Operator.js';

export class Having extends Operator {
  initOperator() {
    this.key = 'having';
  }
}

export default Having