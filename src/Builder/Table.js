import Builder from '../Builder.js';

export class Table extends Builder {
  initBuilder(table) {
    this.key   = 'table';
    this.table = table;
  }
  resolve(context) {
    this.context = {
      ...context,
      table: this.table
    }
    return this.context;
  }
}

export default Table

