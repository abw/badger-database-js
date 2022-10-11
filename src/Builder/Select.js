import { fail, splitList } from '@abw/badger-utils';
import Builder from '../Builder.js';

export class Columns extends Builder {
  initBuilder() {
    this.key = 'select';
  }
  resolveLinkString(columns, context, table, prefix) {
    return this.resolveLinkArray(
      splitList(columns), context, table, prefix
    );
  }
  resolveLinkArray(columns, context, table, prefix) {
    return table
      ? columns.map(
        column => prefix
          ? this.quoteTableColumnAs(column, table, `${prefix}${column}`)
          : this.quoteTableColumn(column, table)
      )
      : columns.map(
        column => prefix
          ? this.quoteColumnAs(column, `${prefix}${column}`)
          : this.quote(column)
      )
  }
  resolveLinkObject(column, context) {
    if (column.column && column.as) {
      return column.table
        ? this.quoteTableColumnAs(
          column.column,
          column.table,
          column.as
        )
        : this.quoteColumnAs(
          column.column,
          column.as
        )
    }
    const cols = column.column || column.columns;
    if (cols) {
      return this.resolveLinkString(cols, context, column.table, column.prefix)
    }
    return fail('Invalid column specified in "columns": ', column);
  }
}

export default Columns