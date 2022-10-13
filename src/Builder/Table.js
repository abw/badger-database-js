import Builder from '../Builder.js';

export class Table extends Builder {
  static buildMethod = 'table'

  initBuilder(table) {
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

