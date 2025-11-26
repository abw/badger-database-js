import Builder from '../Builder.js';
import { comma, INSERT } from '../Constants'

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

  resolveLinkString(columns) {
    return this.quoteTableColumns(undefined, columns)
  }

  resolveLinkArray(columns) {
    return this.quoteTableColumns(undefined, columns)
  }

  resolveLinkObject(column) {
    const cols = column.column || column.columns;
    if (cols) {
      return this.resolveLinkString(cols, column.table)
    }
    this.errorMsg('object', { keys: Object.keys(column).sort().join(', ') });
  }
}

export default Insert