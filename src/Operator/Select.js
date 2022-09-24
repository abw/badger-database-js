import Operator from '../Operator.js';

export class Select extends Operator {
  initOperator() {
    this.key = 'select';
  }
}

export default Select