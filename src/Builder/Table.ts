import Builder, { BuilderContext } from '../Builder'

export class Table extends Builder {
  static buildMethod = 'table'

  tableName: string

  initBuilder(table: string) {
    this.tableName = table;
  }

  resolve(context: BuilderContext) {
    this.context = {
      ...context,
      table: this.tableName
    }
    return this.context;
  }
}

export default Table

