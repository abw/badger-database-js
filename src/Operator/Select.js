import { fail, splitList } from '@abw/badger-utils';
import Operator from '../Operator.js';

export class Select extends Operator {
  initOperator() {
    this.key = 'select';
  }
  resolveLinkString(columns, context) {
    return this.resolveLinkArray(splitList(columns), context);
  }
  resolveLinkArray(columns, context) {
    const table = this.lookupTable(context);
    return columns.map(
      column => this.quoteTableColumn(column, table)
    )
  }
  resolveLinkObject(column, context) {
    if (column.column && column.as) {
      return [
        this.quoteTableColumn(column.column, this.lookupTable(context)),
        this.quote(column.as, context)
      ].join(' AS ');
    }
    return fail('Invalid column specified in "select": ', column);
  }
}

export default Select