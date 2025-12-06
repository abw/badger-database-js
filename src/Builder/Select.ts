import Builder from '../Builder';
import { comma, SELECT } from '../Constants'

export type SelectBuilderColumn  = {
  column?: string
  columns?: string
  as?: string
  table?: string
  prefix?: string
}

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

  resolveLinkString(columns: string | string[], table: string, prefix?: string) {
    return this.quoteTableColumns(table, columns, prefix)
  }

  resolveLinkArray(columns: string[]) {
    if (columns.length === 2) {
      // a two-element array is [column, alias]
      const [column, alias] = columns
      return this.quoteColumnAs(column, alias)
    }
    else if (columns.length === 3) {
      // a three-element array is [table, column, alias]
      const [table, column, alias] = columns
      return this.quoteTableColumnAs(table, column, alias)
    }
    this.errorMsg('array', { n: columns.length });
  }

  resolveLinkObject(column: SelectBuilderColumn) {
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