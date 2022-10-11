import Builder from '../Builder.js';

// this is *probably* deprecated

export class Table extends Builder {
  initBuilder(table) {
    this.key      = 'table';
    this.table    = table;
    this.database = table.database;
  }
  resolve(context) {
    return super.resolve(context, { database: this.database });
  }
}

export default Table

