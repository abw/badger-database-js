import Operator from '../Operator.js';

// this is *probably* deprecated

export class Table extends Operator {
  initOperator(table) {
    this.key      = 'table';
    this.table    = table;
    this.database = table.database;
  }
  resolve(context) {
    return super.resolve(context, { database: this.database });
  }
}

export default Table

