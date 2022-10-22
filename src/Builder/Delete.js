import { isArray } from '@abw/badger-utils';
import Builder from '../Builder.js';
import { comma, DELETE } from '../Constants.js';
import { spaceAfter } from '../Utils/Space.js';

export class Delete extends Builder {
  static buildMethod = 'delete'
  static buildOrder  = 19
  static subMethods  = 'from where'
  static keyword     = DELETE
  static joint       = comma
  static messages    = {
    object: 'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Valid properties are "columns", "column", "table" and "prefix".',
  }
  static generateSQL(values) {
    const keyword = this.keyword;
    const joint   = this.joint;
    return values && values.length
      ? spaceAfter(keyword) + (isArray(values) ? values.join(joint) : values)
      : keyword;
  }
  resolveLink() {
    if (this.args.length) {
      return super.resolveLink();
    }
    else {
      this.context.delete = [ ];
    }
  }
  resolveLinkString(columns, table, prefix) {
    return this.quoteTableColumns(table, columns, prefix)
  }
  resolveLinkObject(column) {
    const cols = column.column || column.columns;
    if (cols) {
      return this.resolveLinkString(cols, column.table, column.prefix)
    }
    this.errorMsg('object', { keys: Object.keys(column).sort().join(', ') });
  }
}

export default Delete