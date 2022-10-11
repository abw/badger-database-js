import Builder from '../Builder.js';
import { isArray, splitList } from '@abw/badger-utils';

export class Where extends Builder {
  initBuilder() {
    this.key = 'where';
  }
  // TODO: check that placeholders are being counted correctly
  resolveLinkString(columns, context) {
    return this.resolveLinkArray(splitList(columns), context)
  }
  resolveLinkArray(columns, context) {
    // const table    = this.lookupTable(context);
    const database = this.lookupDatabase(context);
    return columns.map(
      column => database.engine.formatWherePlaceholder(
        // this.tableColumn(column, table),
        column,
        undefined,
        context.placeholder++
      )
    )
  }
  resolveLinkObject(criteria, context) {
    // const table    = this.lookupTable(context);
    const database = this.lookupDatabase(context);
    return Object.entries(criteria).map(
      ([column, value]) => {
        if (isArray(value)) {
          if (value.length > 1) {
            context.values.push(value[1]);
          }
        }
        else {
          context.values.push(value);
        }
        return database.engine.formatWherePlaceholder(
          // this.tableColumn(column, criteria.table)
          column,
          value,
          context.placeholder++
        )
      }
    )
  }
}

export default Where