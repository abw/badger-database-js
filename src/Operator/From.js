import Operator from '../Operator.js';

export class From extends Operator {
  initOperator(args) {
    this.keyword = 'FROM';
    this.table = args;
  }
  dump() {
    this.debug("From dump")
    return this.keyword + ' ' + this.table;
  }
}

export default From