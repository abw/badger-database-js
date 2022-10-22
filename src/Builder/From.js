import Builder from '../Builder.js';
import { isArray, isObject, isString, splitList } from '@abw/badger-utils';
import { comma, FROM } from '../Constants.js';

export class From extends Builder {
  static buildMethod = 'from'
  static buildOrder  = 30
  static keyword     = FROM
  static joint       = comma
  static messages = {
    array:  'Invalid array with <n> items specified for query builder "<method>" component. Expected [table, alias].',
    object: 'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Valid properties are "tables", "table" and "as".',
  }

  initBuilder(...tables) {
    // store the table name for subsequent columns() calls to use, but
    // we need to be careful to only handle the valid cases, e.g. where
    // it's a string (which might contain multiple table names), an
    // array of [table, alias], or an object containing 'table'
    const table = tables.at(-1);
    if (isString(table)) {
      this.tableName = splitList(table).at(-1);
    }
    else if (isArray(table) && table.length === 2) {
      this.tableName = table[1];
    }
    else if (isObject(table) && table.as) {
      this.tableName = table.as;
    }
  }

  resolve(context) {
    return super.resolve(
      context,
      // if we've got a table defined then add it to the context
      this.tableName
        ? { table: this.tableName }
        : undefined
    )
  }

  resolveLinkString(tables) {
    // split a string of table names and quote each one
    return splitList(tables).map(
      table => this.quote(table)
    );
  }

  resolveLinkArray(table) {
    // a two-element array is [table, alias]
    return table.length === 2
      ? this.quoteTableAs(...table)
      : this.errorMsg('array', { n: table.length });
  }

  resolveLinkObject(table) {
    if (table.table) {
      // if it's an object then it should have a table and optionally an 'as' for an alias
      return table.as
        ? this.quoteTableAs(table.table, table.as)
        : this.quote(table.table)
    }
    else if (table.tables) {
      // or it can have tables
      return this.resolveLinkString(table.tables);
    }
    this.errorMsg('object', { keys: Object.keys(table).sort().join(', ') });
  }
}

export default From