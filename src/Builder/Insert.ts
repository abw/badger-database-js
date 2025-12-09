import Builder from '../Builder'
import { comma, INSERT } from '../Constants'

export type InsertColumn = string | string[] | InsertColumnObject
export type InsertColumnObject = {
  column?: string
  columns?: string
  table?: string
}

export class Insert extends Builder {
  static buildMethod = 'insert'
  static buildOrder  = 17
  static subMethods  = 'into join values returning'
  static keyword     = INSERT
  static joint       = comma
  static messages    = {
    object: 'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Valid properties are "columns" and "column".',
  }

  static generateSQL() {
    return this.keyword;
  }

  resolveLink() {
    if (this.args.length) {
      return super.resolveLink();
    }
    else {
      this.context.insert = [ ];
    }
  }

  resolveLinkString(columns: string) {
    return this.quoteTableColumns(undefined, columns)
  }

  resolveLinkArray(columns: string[]) {
    return this.quoteTableColumns(undefined, columns)
  }

  resolveLinkObject(column: InsertColumnObject) {
    const cols = column.column || column.columns;
    if (cols) {
      return this.resolveLinkString(cols)
      // return this.resolveLinkString(cols, column.table)    // Hmmm... that column.table shouldn't be there???
    }
    this.errorMsg('object', { keys: Object.keys(column).sort().join(', ') });
  }
}

export default Insert