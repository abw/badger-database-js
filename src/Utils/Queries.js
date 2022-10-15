import Builder from "../Builder.js";
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
  object.query = function(source, config) {
    let sql;

    if (source.match(singleWord)) {
      // if the source is a single word then it must be a named query
      let query = this.namedQuery(source);

      if (isString(query)) {
        // if we've got a string then expand any fragments
        sql = expandFragments(query, this.fragments);
      }
      else if (query instanceof Builder) {
        // if we have a query builder element then ask it to generate the SQL and
        // provide any values it collected along the way.
        sql = query.sql();
        config = query.contextValues();
        // TODO: should merge config whereValues and havingValues into any in config passed as argument
      }
      else {
        // otherwise fail
        fail(`Named query "${source}" returned invalid result: `, query);
      }
    }
    else {
      // if it's not a named query then it's an SQL query possibly with embedded fragments
      sql = expandFragments(source, this.fragments);
    }

    return new Query(this.engine, sql, config);
  }

  object.namedQuery = function(source) {
    this.debugData("namedQuery()", { source });
    let query = this.queries[source] || fail("Invalid named query specified: ", source);
    return isFunction(query)
      ? query(this)
      : query;
  }

  object.sql = function(name, config) {
    this.debugData("sql()", { name, config });
    return this.query(name, config).sql();
  }

  object.run = function(query, params, options) {
    this.debugData("run()", { query, params, options });
    return this.query(query).run(params, options)
  }

  object.one = function(query, params, options) {
    this.debugData("one()", { query, params, options });
    return this.query(query).one(params, options)
  }

  object.any = function(query, params, options) {
    this.debugData("any()", { query, params, options });
    return this.query(query).any(params, options)
  }

  object.all = function(query, params, options) {
    this.debugData("all()", { query, params, options });
    return this.query(query).all(params, options)
  }
}
