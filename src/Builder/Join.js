import { fail } from '@abw/badger-utils';
import Builder from '../Builder.js';

export class Join extends Builder {
  initBuilder() {
    this.key = 'join';
  }
  TODOresolveLinkString(columns, context) {
    return this.resolveLinkArray(splitList(columns), context);
  }
  TODOresolveLinkArray(columns, context) {
    const table = this.lookupTable(context);
    return columns.map(
      column => this.quoteTableColumn(column, table)
    )
  }
  resolveLinkObject(column, context) {
    if (column.table && column.from && column.to) {
      return [
        this.quoteTableColumn(column.column, this.lookupTable(context)),
        this.quote(column.as, context)
      ].join(' AS ');
    }
    return fail('Invalid column specified in "select": ', column);
  }
}

export default Join