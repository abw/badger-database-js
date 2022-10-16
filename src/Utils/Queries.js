import Builder from "../Builder.js";
import { fail, isString } from "@abw/badger-utils";

export const isQuery = query =>
  isString(query) || (query instanceof Builder)

export const expandFragments = (query, fragments={}, maxDepth=16) => {
  query = query.trim();
  let sql = query;
  let runaway = 0;
  let expanded = [ ];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let replaced = false;
    sql = sql.replace(
      /<(\w+?)>/g,
      (match, word) => {
        replaced = true;
        expanded.push(word);
        return fragments[word] || fail("Invalid fragment in SQL expansion: <", word, ">");
      }
    );
    if (! replaced) {
      break;
    }
    if (++runaway >= maxDepth) {
      fail(
        "Maximum SQL expansion limit (maxDepth=", maxDepth, ") exceeded: ",
        expanded.join(' -> ', )
      )
    }
  }
  return sql;
}
