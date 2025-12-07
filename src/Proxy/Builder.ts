import { extract, splitHash } from '@abw/badger-utils'
import { article, QueryBuilderError } from '../Utils'
import { SelectColumn } from '../Builder/Select'
import { FromTable } from '../Builder/From'
import Builder from '../Builder'
import { BuilderInstance } from '../types'
import { WhereColumn } from '../Builder/Where'

// In the usual case we have an object mapping methods names to
// builder classes (`builders`) and a `parent` object.  However a
// builder node can define a static subMethods item which defines
// the allowable methods that can follow it.  A new builder proxy
// is created with the options object containing a `valid` object
// containing the valid query methods and `keyword` set to the
// keyword for the builder node that declared the subMethods.
// This allows us to generate a better error if an invalid method
// is added, e.g. "SELECT cannot be added to a DELETE query".

// export type BuildSelect = (column: SelectColumn, ...more: SelectColumn[]) => BuilderProxy
export interface BuilderMethods {
  /**
   * Add a select to the current query builder.
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
  from(table: FromTable, ...moreTables: FromTable[]): this
  where(criteria: WhereColumn, ...moreCriteria: WhereColumn[]): this
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
