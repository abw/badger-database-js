import Builder from '../Builder.js';

export class Table extends Builder {
  static buildMethod = 'table'

  initBuilder(table) {
    this.tableName = table;
  }

  resolve(context) {
    this.context = {
      ...context,
      table: this.tableName
    }
    return this.context;
  }
}

export default Table

