import Builder from '../Builder.js';
import { comma, SELECT } from '../Constants.js';

export class Select extends Builder {
  static buildMethod = 'select'
  static buildOrder  = 20;
  static subMethods  = 'select columns from table prefix join where having group groupBy order orderBy limit offset range returning'
  static keyword     = SELECT
  static joint       = comma
  static messages    = {
    array:  'Invalid array with <n> items specified for query builder "<method>" component. Expected [column, alias] or [table, column, alias].',
    object: 'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Valid properties are "columns", "column", "table", "prefix" and "as".',
  }

  resolveLinkString(columns, table, prefix) {
    return this.quoteTableColumns(table, columns, prefix)
  }

  resolveLinkArray(columns) {
    if (columns.length === 2) {
      // a two-element array is [column, alias]
      return this.quoteColumnAs(...columns);
    }
    else if (columns.length === 3) {
      // a three-element array is [table, column, alias]
      return this.quoteTableColumnAs(...columns)
    }
    this.errorMsg('array', { n: columns.length });
  }

  resolveLinkObject(column) {
    if (column.column && column.as) {
      // object can contain "column", "as" and optional "table"
      return column.table
        ? this.quoteTableColumnAs(
          column.table,
          column.column,
          column.as
        )
        : this.quoteColumnAs(
          column.column,
          column.as
        )
    }
    // otherwise it should define "column" or "columns"
    const cols = column.column || column.columns;
    if (cols) {
      return this.resolveLinkString(cols, column.table, column.prefix)
    }
    this.errorMsg('object', { keys: Object.keys(column).sort().join(', ') });
  }
}

export default Select