import Operator from '../Operator.js';

export class Where extends Operator {
  initOperator() {
    this.key = 'where';
  }
}

export default Where