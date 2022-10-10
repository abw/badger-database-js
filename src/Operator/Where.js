import Operator from '../Operator.js';
import { splitList } from '@abw/badger-utils';

export class Where extends Operator {
  initOperator() {
    this.key = 'where';
  }
  // TODO: check that placeholders are being counted correctly
  resolveLinkString(columns, context) {
    return this.resolveLinkArray(splitList(columns), context)
  }
  resolveLinkArray(columns, context) {
    const table    = this.lookupTable(context);
    const database = this.lookupDatabase(context);
    return columns.map(
      column => database.engine.formatWherePlaceholder(
        this.tableColumn(column, table),
        undefined,
        context.placeholder++
      )
    )
  }
  resolveLinkObject(criteria, context) {
    const table    = this.lookupTable(context);
    const database = this.lookupDatabase(context);
    return Object.entries(criteria).map(
      ([column, value]) => {
        context.values.push(value);
        return database.engine.formatWherePlaceholder(
          this.tableColumn(column, table),
          value,
          context.placeholder++
        )
      }
    )
  }
}

export default Where