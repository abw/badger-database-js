import Builder, { BuilderContext } from '../Builder'
import { isArray, isObject, isString, splitList } from '@abw/badger-utils'
import { comma, FROM } from '../Constants'

export type FromTable = string | string[] | FromTableObject
export type FromTableObject = {
  table?: string
  tables?: string
  as?: string
  sql?: string | TemplateStringsArray
}

export class From extends Builder {
  static buildMethod = 'from'
  static buildOrder  = 30
  static keyword     = FROM
  static joint       = comma
  static messages = {
    array:  'Invalid array with <n> items specified for query builder "<method>" component. Expected [table, alias].',
    object: 'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Valid properties are "tables", "table" and "as".',
  }

  tableName: string

  initBuilder(...tables: string[]) {
    // store the table name for subsequent columns() calls to use, but
    // we need to be careful to only handle the valid cases, e.g. where
    // it's a string (which might contain multiple table names), an
    // array of [table, alias], or an object containing 'table'
    const table: FromTable = tables.at(-1);
    if (isString(table)) {
      this.tableName = splitList(table).at(-1) as string;
    }
    else if (isArray(table) && (table as string[]).length === 2) {
      this.tableName = table[1];
    }
    else if (isObject(table) && (table as FromTableObject).as) {
      this.tableName = (table as FromTableObject).as;
    }
  }

  resolve(context: BuilderContext) {
    return super.resolve(
      context,
      // if we've got a table defined then add it to the context
      this.tableName
        ? { table: this.tableName }
        : undefined
    )
  }

  resolveLinkString(tables: string | string[]) {
    // split a string of table names and quote each one
    return splitList(tables).map(
      (table: string) => this.quote(table)
    );
  }

  resolveLinkArray(table: string[]) {
    // a two-element array is [table, alias]
    return table.length === 2
      ? this.quoteTableAs(table[0], table[1])
      : this.errorMsg('array', { n: table.length });
  }

  resolveLinkObject(table: FromTableObject) {
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