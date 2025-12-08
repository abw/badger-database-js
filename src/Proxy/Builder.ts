import { extract, splitHash } from '@abw/badger-utils'
import { article, QueryBuilderError } from '../Utils'
import { SelectColumn } from '../Builder/Select'
import { FromTable } from '../Builder/From'
import Builder from '../Builder'
import { BuilderInstance } from '../types'
import { WhereColumn } from '../Builder/Where'
import { JoinTable } from '../Builder/Join'
import { OrderColumn } from '../Builder/Order'
import { GroupByColumn } from '../Builder/Group'
import { RangeObject } from '../Builder/Range'

// export type BuildSelect = (column: SelectColumn, ...more: SelectColumn[]) => BuilderProxy
export interface BuilderMethods {
  /**
   * Add a `select ...` clause to the query.
   * @example
   * query.select('id', 'name', 'email') // select multiple columns
   * @example
   * query.select('id name email')  // short-hand form
   * @example
   * query.select('users.id companies.name') // with explicit table names
   * @example
   * query.select(['id', 'userId']) // with alias: select `id` as `userId`
   * @example
   * query.select({ column: 'id', as: 'userId' }) // alias as above
   * @example
   * // selects users.id as user_id, users.name as user_name
   * query.select({ table: 'users', columns: 'id name', prefix: 'user_' })
   */
  select(column: SelectColumn, ...moreColumns: SelectColumn[]): this
  /**
   * Add a `from ...` clause to the query.
   * @example
   * query.from('users', 'companies') // select from multiple tables
   * @example
   * query.from('users companies')  // short-hand form
   * @example
   * query.from({ tables: 'users companies' }) // alternate form
   * @example
   * query.from({ table: 'users', as: 'people' }) // table alias
   * @example
   * query.from(['users', 'people']) // shorthand form for table alias
   */
  from(table: FromTable, ...moreTables: FromTable[]): this
  /**
   * Add a `where ...` clause to the query.
   * @example
   * query.where('id') // single column placeholder
   * @example
   * query.where('id name') // multiple column placeholders
   * @example
   * query.where('users.id companies.id') // columns with table names
   * @example
   * query.where(['id', 123]) // column with value provided for placeholder
   * @example
   * query.where({ id: 123, status: 'active' }) // multiple columns with values provided for placeholder
   * @example
   * query.where(['age', gt(18)]) // column with comparison
   * @example
   * query.where({ age: gt(18), status: in('active', 'pending') }) // multiple comparison operators
   * @example
   * query.where({ age: isNull(), status: notNull() }) // `IS NULL` / `NOT NULL`
   */
  where(criteria: WhereColumn, ...moreCriteria: WhereColumn[]): this
  /**
   * Add a `join ...` clause to the query.
   * @example
   * query.join('users.company_id = companies.id') // shorthand join specification
   * @example
   * query.join({ from: 'users.company_id', to: 'companies.id' }) // expanded form
   */
  join(table: JoinTable, ...moreTables: JoinTable[]): this
  /**
   * Add an `order by ...` clause to the query.
   * @example
   * query.order('name') // order by a single column
   * @example
   * query.order('surname forename') // order by multiple columns
   * @example
   * query.order(['surname forename', 'DESC']) // explicit order: `ASC` or `DESC`
   * @example
   * query.order({ columns: 'surname forename', dir: 'DESC' }) // object form
   */
  order(orderBy: OrderColumn, ...moreOrders: OrderColumn[]): this
  /**
   * Add an `order by ...` clause to the query.
   * @example
   * query.orderBy('name') // order by a single column
   * @example
   * query.orderBy('surname forename') // order by multiple columns
   * @example
   * query.orderBy(['surname forename', 'DESC']) // explicit order: `ASC` or `DESC`
   * @example
   * query.orderBy({ columns: 'surname forename', dir: 'DESC' }) // object form
   */
  orderBy(orderBy: OrderColumn, ...moreOrders: OrderColumn[]): this
  /**
   * Add an `group by ...` clause to the query.
   * @example
   * query.group('name') // group by a single column
   * @example
   * query.group('users.company_id companies.sector') // group by multiple columns
   * @example
   * query.group({ columns: 'company_id' }) // object form
   */
  group(orderBy: GroupByColumn, ...moreOrders: GroupByColumn[]): this
  /**
   * Add an `group by ...` clause to the query.
   * @example
   * query.groupBy('name') // group by a single column
   * @example
   * query.groupBy('users.company_id companies.sector') // group by multiple columns
   * @example
   * query.groupBy({ columns: 'company_id' }) // object form
   */
  groupBy(orderBy: GroupByColumn, ...moreOrders: GroupByColumn[]): this
  /**
   * Add a `having ...` clause to the query.
   * @example
   * query.having('id') // single column placeholder
   * @example
   * query.having('id name') // multiple column placeholders
   * @example
   * query.having('users.id companies.id') // columns with table names
   * @example
   * query.having(['id', 123]) // column with value provided for placeholder
   * @example
   * query.having({ id: 123, status: 'active' }) // multiple columns with values provided for placeholder
   * @example
   * query.having(['age', gt(18)]) // column with comparison
   * @example
   * query.having({ age: gt(18), status: in('active', 'pending') }) // multiple comparison operators
   * @example
   * query.having({ age: isNull(), status: notNull() }) // `IS NULL` / `NOT NULL`
   */
  having(criteria: WhereColumn, ...moreCriteria: WhereColumn[]): this
  /**
   * Add a `limit ...` clause to the query.
   * @example
   * query.limit(10) // limit to 10 records
   */
  limit(rows: number): this
  /**
   * Add an `offset ...` clause to the query.
   * @example
   * query.offset(20) // offset of rows returned
   */
  offset(rows: number): this
  /**
   * Add a clause to the query to limit the rows returned to a range.
   * @example
   * query.range(10) // first row returned
   * @example
   * query.range(10, 20) // first and last rows returned
   * @example
   * query.range({ from: 10, to: 20 }) // explicit object form
   */
  range(from: number, to?: number): this
  range(range: RangeObject): this
  /**
   * Set the table name for columns generated by subsequent calls to `columns()`
   * @example
   * query.table('users') // specify table name
   */
  table(table: string): this
  /**
   * Set the prefix for column names generated by subsequent calls to `columns()`
   * @example
   * query.prefix('_user') // specify column prefix
   */
  prefix(prefix?: string): this
  /**
   * Add a `select ...` clause, generating column names using the current table
   * specified via `table()` and/or any column prefix via `prefix()`.
   * @example
   * query.columns('id', 'name', 'email') // select multiple columns
   * @example
   * query.columns('id name email')  // short-hand form
   * @example
   * query.columns(['id', 'userId']) // with alias: select `id` as `userId`
   * @example
   * query.columns({ column: 'id', as: 'userId' }) // alias as above
   * @example
   * // selects users.id as user_id, users.name as user_name
   * query.columns({ table: 'users', columns: 'id name', prefix: 'user_' })
   */
  columns(column: SelectColumn, ...moreColumns: SelectColumn[]): this
}

export type BuilderProxy = Builder & BuilderMethods

interface BuilderProxyOptions {
  valid?: Record<string, boolean>
  keyword?: string
}

/*
type BuilderClass<T = any> = {
  new (parent: any, ...args: any[]): T;
  subMethods?: string[];
  validFor?: string;
  keyword?: string;
}
*/

// In the usual case we have an object mapping methods names to
// builder classes (`builders`) and a `parent` object.  However a
// builder node can define a static subMethods item which defines
// the allowable methods that can follow it.  A new builder proxy
// is created with the options object containing a `valid` object
// containing the valid query methods and `keyword` set to the
// keyword for the builder node that declared the subMethods.
// This allows us to generate a better error if an invalid method
// is added, e.g. "SELECT cannot be added to a DELETE query".

export const builderProxy = (
  builders,
  parent: BuilderInstance,
  options: BuilderProxyOptions = { }
): BuilderProxy =>
  new Proxy(
    parent,
    {
      get(target, prop: string) {
        // console.log('builderProxy %s', prop);

        if (prop === 'toString') {
          // special case for toString() which Proxies handle differently
          return target.toString.bind(target);
        }

        // if it's not a builder method then delegate to the target
        const bclass = builders[prop];
        if (! bclass) {
          return Reflect.get(target, prop);
        }

        if (options.valid) {
          // if a parent has specified the valid subMethods that can follow
          // it then we check that the method is listed in there...
          let valid = Boolean(options.valid[prop]);

          // ...but it might be a custom method that someone has added that the
          // parent query (SELECT, INSERT, etc) didn't know about, so we allow
          // the builder method to define a static validFor item to list the
          // top-level queries that it can appear in, e.g. 'SELECT INSERT'
          if (! valid && bclass.validFor) {
            valid = Boolean(splitHash(bclass.validFor)[options.keyword])
          }

          // if it's not valid then we throw an error
          if (! valid) {
            throw new QueryBuilderError(
              `${prop}() is not a valid builder method for ${article(options.keyword)} ${options.keyword} query.`
            );
          }
        }

        // console.log('builderProxy builder: %s =>', prop, bclass);
        return (
          (...args) => {
            const builder   = new bclass(parent, ...args);
            const methods   = bclass.subMethods;
            if (methods) {
              return builderProxy(
                builders, builder,
                {
                  valid: extract(builders, methods) as Record<string, boolean>,
                  keyword: bclass.keyword
                }
              )
            }
            else {
              return builderProxy(builders, builder)
            }
          }
        ).bind(target);
      }
    }
  ) as BuilderProxy

export default builderProxy
