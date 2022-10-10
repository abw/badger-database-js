import { fail, splitList } from '@abw/badger-utils';
import Operator from '../Operator.js';

export class Select extends Operator {
  initOperator() {
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
        ? this.quoteTableColumnAs(column, table, `${prefix}${column}`)
        : this.quoteTableColumn(column, table)
    )
  }
  resolveLinkObject(column, context) {
    if (column.column && column.as) {
      return this.quoteTableColumnAs(
        column.column,
        column.table || this.lookupTable(context),
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