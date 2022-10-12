import Builder from '../Builder.js';
import { splitList } from '@abw/badger-utils';

const messages = {
  array:  'Invalid array with <n> items specified for query builder "<type>" component. Expected [column, alias] or [table, column, alias].',
  object: 'Invalid object with "<keys>" properties specified for query builder "<type>" component.  Valid properties are "columns", "column", "table", "prefix" and "as".',
}

export class Select extends Builder {
  initBuilder() {
    this.key = 'select';
    this.messages = messages;
  }

  resolveLinkString(columns, table, prefix) {
    // function to map columns to depends on table and/or prefix being defined
    const func = table
      ? prefix
        ? column => this.quoteTableColumnAs(table, column, `${prefix}${column}`)
        : column => this.quoteTableColumn(table, column)
      : prefix
        ? column => this.quoteColumnAs(column, `${prefix}${column}`)
        : column => this.quote(column)
    ;
    // split string into items and apply function
    return splitList(columns).map(func);
  }

  resolveLinkArray(columns) {
    if (columns.length === 2) {
      // a two-element array is [column, alias]
      return this.quoteColumnAs(...columns);
    }
    else if (columns.length === 3) {
      // a three-element array is [table, column, alias]
      return this.quoteTableColumnAs(...columns)
    }
    this.errorMsg('array', { n: columns.length });
  }

  resolveLinkObject(column) {
    if (column.column && column.as) {
      // object can contain "column", "as" and optional "table"
      return column.table
        ? this.quoteTableColumnAs(
          column.table,
          column.column,
          column.as
        )
        : this.quoteColumnAs(
          column.column,
          column.as
        )
    }
    // otherwise it should define "column" or "columns"
    const cols = column.column || column.columns;
    if (cols) {
      return this.resolveLinkString(cols, column.table, column.prefix)
    }
    this.errorMsg('object', { keys: Object.keys(column).sort().join(', ') });
  }
}

export default Select