import Operator from '../Operator.js';

export class Select extends Operator {
  initOperator(args) {
    this.command = 'SELECT';
    this.keyword = 'SELECT';
    this.columns = args;
  }
  dump() {
    this.debug("Select dump")
    return this.keyword + ' ' + this.columns;
  }
}

export default Select