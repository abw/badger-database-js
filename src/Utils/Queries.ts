import Builder from '../Builder.js'
import { fail, isString } from '@abw/badger-utils'
import Queryable from '../Queryable'

export const isQuery = (query: any) =>
  isString(query) || (query instanceof Builder)

export const expandFragments = (
  query: string,
  queryable:
  Queryable, maxDepth=16
) => {
  query = query.trim();
  let sql = query;
  let runaway = 0;
  let expanded = [ ];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let replaced = false;
    sql = sql.replace(
      /<(\w+?)>/g,
      (_match, word) => {
        replaced = true;
        expanded.push(word);
        return queryable.fragment(word);
      }
    );
    if (! replaced) {
      break;
    }
    if (++runaway >= maxDepth) {
      fail(
        `Maximum SQL expansion limit (maxDepth=${maxDepth}) exceeded: `,
        expanded.join(' -> ', )
      )
    }
  }
  return sql;
}
