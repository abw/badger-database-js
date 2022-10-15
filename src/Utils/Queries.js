import Query from "../Query.js";
import { singleWord } from "../Constants.js";
import { fail, isFunction, isString } from "@abw/badger-utils";

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

export const addQueryMethods = object => {
  object.buildQuery = function(source, config) {
    this.debugData("buildQuery()", { source });
    return new Query(
      this.engine,
      this.expandQuery(source),
      config
    );
  }

  object.expandQuery = function(source, config) {
    this.debugData("expandQuery()", { source });
    // if the source is a single word then it must be a named query
    // otherwise it's an SQL query possibly with embedded fragments
    return source.match(singleWord)
      ? this.expandNamedQuery(source, config)
      : expandFragments(source, this.fragments);
  }

  object.expandNamedQuery = function(name) {
    this.debugData("expandNamedQuery()", { name });
    const query = this.query(name);
    // the named query can be a string with embedded fragments that should
    // be expanded, or it can be a query builder
    return isString(query)
      ? expandFragments(query, this.fragments)
      : query;
  }

  object.query = function(source) {
    this.debugData("query()", { source });
    const query = this.queries[source] || fail("Invalid named query specified: ", source);
    // a named query can be a function which we call, returning either a string
    // or a query builder
    return isFunction(query)
      ? query(this)
      : query;
  }

  object.sql = function(name, config) {
    this.debugData("sql()", { name, config });
    return this.buildQuery(name, config).sql();
  }

  object.run = function(query, params, options) {
    this.debugData("run()", { query, params, options });
    return this.buildQuery(query).run(params, options)
  }

  object.one = function(query, params, options) {
    this.debugData("one()", { query, params, options });
    return this.buildQuery(query).one(params, options)
  }

  object.any = function(query, params, options) {
    this.debugData("any()", { query, params, options });
    return this.buildQuery(query).any(params, options)
  }

  object.all = function(query, params, options) {
    this.debugData("all()", { query, params, options });
    return this.buildQuery(query).all(params, options)
  }
}
