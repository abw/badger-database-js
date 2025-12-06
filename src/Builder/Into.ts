import Builder, { BuilderContext } from '../Builder';
import { parens, spaceAfter, spaceBefore } from '../Utils/Space'
import { blank, comma, INTO, newline, VALUES } from '../Constants'
import { isArray, isString } from '@abw/badger-utils';
import { Stringable } from '../types'

export class Into extends Builder {
  static buildMethod = 'into'
  static buildOrder  = 29
  static keyword     = INTO
  static joint       = comma

  tableName: string

  static generateSQL(values: Stringable | Stringable[], context?: BuilderContext) {
    const keyword  = this.keyword;
    const joint    = this.joint;
    const database = context.database;
    const columns  = context.insert || [ ];
    let   place    = context.placeholder;
    const into     = spaceAfter(keyword) + (isArray(values) ? values.join(joint) : values)
    const cols     = columns.length ? spaceBefore(parens(columns.join(comma))) : blank
    const vals     = columns.length ? newline + spaceAfter(VALUES) + parens(
      columns.map(
        () => database.engine.formatPlaceholder(
          place++
        )
      ).join(comma)
    ) : blank;
    return into + cols + vals;
  }

  initBuilder(...tables: any[]) {
    // store the table name for subsequent columns() calls to use, but
    if (tables.length === 1 && isString(tables[0])) {
      this.tableName = tables[0];
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

  resolveLinkString(table: string) {
    // split a string of table names and quote each one
    return [
      this.quote(table)
    ]
  }
}

export default Into