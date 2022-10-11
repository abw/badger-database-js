import { QueryBuilderError, thrower } from '../Utils/Error.js';
import Select from './Select.js';

export const throwColumnsError = thrower(
  {
    array:  'Invalid array with <n> items specified for query builder "columns" component. Expected [column, alias] or [table, column, alias].',
    object: 'Invalid object with "<keys>" properties specified for query builder "columns" component.  Valid properties are "columns", "column", "table", "prefix" and "as".',
  },
  QueryBuilderError
)

export class Columns extends Select {
  initBuilder() {
    this.key = 'select';
  }

  resolveLinkString(columns, table=this.lookupTable(), prefix=this.context.prefix) {
    // this is the same as Select, but with table defaulting to last defined
    // table and prefix defaulting to last defined prefix
    return super.resolveLinkString(columns, table, prefix);
  }

  resolveLinkArray(columns) {
    const table = this.lookupTable()

    if (columns.length === 2) {
      // two-element array is [column, alias]
      return this.quoteTableColumnAs(table, ...columns);
      // table, columns[0], prefix ? `${prefix}${columns[1]}` : columns[1]);
    }
    else if (columns.length === 3) {
      // three-element array is [table, column, alias]
      return this.quoteTableColumnAs(...columns)
    }
    throwColumnsError('array', { n: columns.length });
  }

  resolveLinkObject(column) {
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
    throwColumnsError('object', { keys: Object.keys(column).sort().join(', ') });
  }
}

export default Columns