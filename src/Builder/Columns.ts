import Select, { SelectColumnObject } from './Select';

export class Columns extends Select {
  static buildMethod = 'columns'
  static contextSlot = 'select'

  initBuilder() {
    // generated fragments get stored in the context with those from select()
    // this.key = 'select';
  }

  resolveLinkString(
    columns: string | string[],
    table: string = this.lookupTable(),
    prefix: string = this.context.prefix
  ) {
    // this is the same as Select, but with table defaulting to last defined
    // table and prefix defaulting to last defined prefix
    return super.resolveLinkString(columns, table, prefix);
  }

  resolveLinkArray(
    columns: string[]
  ) {
    const table = this.lookupTable()

    if (columns.length === 2) {
      // two-element array is [column, alias]
      const [column, alias] = columns
      return this.quoteTableColumnAs(table, column, alias);
    }
    else if (columns.length === 3) {
      // three-element array is [table, column, alias]
      const [table, column, alias] = columns
      return this.quoteTableColumnAs(table, column, alias)
    }
    this.errorMsg('array', { n: columns.length });
  }

  resolveLinkObject(column: SelectColumnObject) {
    const table = this.lookupTable()

    if (column.column && column.as) {
      // object can contain "column" and "as" with optional "table"
      return this.quoteTableColumnAs(
        column.table || table,
        column.column,
        column.as
      )
    }
    // or it must have "column" or "columns"
    const cols = column.column || column.columns;
    if (cols) {
      return this.resolveLinkString(cols, column.table || table, column.prefix || this.context.prefix)
    }
    this.errorMsg('object', { keys: Object.keys(column).sort().join(', ') });
  }
}

export default Columns