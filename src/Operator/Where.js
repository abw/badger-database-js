import Operator from '../Operator.js';

export class Where extends Operator {
  initOperator(args) {
    this.keyword = 'WHERE';
    this.condition = args;
  }
  dump() {
    this.debug("Where dump")
    return this.keyword + ' ' + this.condition;
  }
}

export default Where