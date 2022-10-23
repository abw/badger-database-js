import { blank, comma, INTO } from '../Constants.js';
import { isArray, isString } from '@abw/badger-utils';
import Builder from '../Builder.js';
import { parens, spaceAfter, spaceBefore } from '../Utils/Space.js';

export class Into extends Builder {
  static buildMethod = 'into'
  static buildOrder  = 29
  static subMethods  = 'values returning'
  static keyword     = INTO
  static joint       = comma

  static generateSQL(values, context) {
    const keyword = this.keyword;
    const joint   = this.joint;
    const columns = context.insert;
    return spaceAfter(keyword)
      + (isArray(values) ? values.join(joint) : values)
      + (columns ? spaceBefore(parens(columns.join(comma))) : blank)
  }

  initBuilder(...tables) {
    // store the table name for subsequent columns() calls to use, but
    if (tables.length === 1 && isString(tables[0])) {
      this.tableName = tables[0];
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

  resolveLinkString(table) {
    // split a string of table names and quote each one
    return [
      this.quote(table)
    ]
  }
}

export default Into