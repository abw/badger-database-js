import Operator from '../Operator.js';

export class Join extends Operator {
  initOperator() {
    this.key = 'join';
  }
}

export default Join