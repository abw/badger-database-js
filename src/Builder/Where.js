import Builder from '../Builder.js';
import { isArray, splitList } from '@abw/badger-utils';

export class Where extends Builder {
  initBuilder() {
    this.key = 'where';
  }
  // TODO: check that placeholders are being counted correctly
  resolveLinkString(columns) {
    return this.resolveLinkArray(splitList(columns))
  }
  resolveLinkArray(columns) {
    // const table    = this.lookupTable(context);
    const database = this.lookupDatabase();
    return columns.map(
      column => database.engine.formatWherePlaceholder(
        // this.tableColumn(column, table),
        column,
        undefined,
        this.context.placeholder++
      )
    )
  }
  resolveLinkObject(criteria) {
    // const table    = this.lookupTable(context);
    const database = this.lookupDatabase();
    return Object.entries(criteria).map(
      ([column, value]) => {
        if (isArray(value)) {
          if (value.length > 1) {
            this.context.values.push(value[1]);
          }
        }
        else {
          this.context.values.push(value);
        }
        return database.engine.formatWherePlaceholder(
          // this.tableColumn(column, criteria.table)
          column,
          value,
          this.context.placeholder++
        )
      }
    )
  }
}

export default Where