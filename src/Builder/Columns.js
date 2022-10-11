import { fail, splitList } from '@abw/badger-utils';
import Builder from '../Builder.js';

export class Select extends Builder {
  initBuilder() {
    this.key = 'select';
  }
  resolveLinkString(columns, context, table=this.lookupTable(context), prefix) {
    return this.resolveLinkArray(
      splitList(columns), context, table, prefix
    );
  }
  resolveLinkArray(columns, context, table=this.lookupTable(context), prefix) {
    return columns.map(
      column => prefix
        ? this.quoteTableColumnAs(table, column, `${prefix}${column}`)
        : this.quoteTableColumn(table, column)
    )
  }
  resolveLinkObject(column, context) {
    if (column.column && column.as) {
      return this.quoteTableColumnAs(
        column.table || this.lookupTable(context),
        column.column,
        column.as
      )
    }
    const cols = column.column || column.columns;
    if (cols) {
      return this.resolveLinkString(cols, context, column.table, column.prefix)
    }
    return fail('Invalid column specified in "select": ', column);
  }
}

export default Select