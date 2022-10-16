import Query from "./Query.js";
import { singleWord } from "./Constants.js";
import { fail, isFunction, isString } from "@abw/badger-utils";
import { expandFragments } from "./Utils/Queries.js";
import { missing } from "./Utils/Error.js";


export class Queryable {
  constructor(engine) {
    this.engine    = engine || missing('engine');
  }

  buildQuery(source, config) {
    this.debugData("buildQuery()", { source });
    return new Query(
      this.engine,
      isString(source) ? this.expandQuery(source) : source,
      config
    );
  }

  expandQuery(source, config) {
    this.debugData("expandQuery()", { source });
    // if the source is a single word then it must be a named query
    // otherwise it's an SQL query possibly with embedded fragments
    return source.match(singleWord)
      ? this.expandNamedQuery(source, config)
      : expandFragments(source, this.fragments);
  }

  expandNamedQuery(name) {
    this.debugData("expandNamedQuery()", { name });
    const query = this.query(name);
    // the named query can be a string with embedded fragments that should
    // be expanded, or it can be a query builder
    return isString(query)
      ? expandFragments(query, this.fragments)
      : query;
  }

  query(source) {
    this.debugData("query()", { source });
    const query = this.queries[source] || fail("Invalid named query specified: ", source);
    // a named query can be a function which we call, returning either a string
    // or a query builder
    return isFunction(query)
      ? query(this)
      : query;
  }

  sql(name, config) {
    this.debugData("sql()", { name, config });
    return this.buildQuery(name, config).sql();
  }

  run(query, params, options) {
    this.debugData("run()", { query, params, options });
    return this.buildQuery(query).run(params, options)
  }

  one(query, params, options) {
    this.debugData("one()", { query, params, options });
    return this.buildQuery(query).one(params, options)
  }

  any(query, params, options) {
    this.debugData("any()", { query, params, options });
    return this.buildQuery(query).any(params, options)
  }

  all(query, params, options) {
    this.debugData("all()", { query, params, options });
    return this.buildQuery(query).all(params, options)
  }
}

export default Queryable