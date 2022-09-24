import Operator from '../Operator.js';

export class Database extends Operator {
  initOperator(args) {
    this.database = args;
  }
  resolve(context) {
    return {
      database: this.database,
      ...context,
    }
  }
  dump() {
    this.debug("From dump")
    return this.keyword + ' ' + this.table;
  }
}

export default Database