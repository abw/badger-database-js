import Builder from './Builder.js'
import { fail, isArray, isFunction, isString } from "@abw/badger-utils";
import { addDebugMethod, missing } from './Utils/index.js';

export class Query {
  constructor(engine, query, config={}) {
    this.engine       = engine || missing('engine');
    this.setValues    = config.setValues    || [ ];
    this.whereValues  = config.whereValues  || [ ];
    this.havingValues = config.havingValues || [ ];
    this.transact     = config.transact;

    if (isString(query)) {
      this.query = query;
    }
    else if (query instanceof Builder) {
      // if we have a query builder element then ask it to generate the SQL and
      // provide any whereValues/havingValues it collected along the way that we
      // combine with any provided in the config
      this.query = query.sql();
      const values = query.contextValues();
      Object.keys(values).forEach(
        key => this[key] = [ ...values[key], ...this[key] ]
      )
    }
    else {
      fail(`Invalid query type: `, query);
    }

    addDebugMethod(this, 'query', this.config);
  }

  sql() {
    return this.query;
  }

  run(...args) {
    const sql = this.sql();
    const [values, options] = this.queryArgs(args);
    this.debugData("run()", { sql, values, options });
    return this.engine.run(sql, values, options)
  }

  one(...args) {
    const sql    = this.sql();
    const [values, options] = this.queryArgs(args);
    this.debugData("one()", { sql, values, options });
    return this.engine.one(sql, values, options)
  }

  any(...args) {
    const sql = this.sql();
    const [values, options] = this.queryArgs(args);
    this.debugData("any()", { sql, values, options });
    return this.engine.any(sql, values, options)
  }

  all(...args) {
    const sql = this.sql();
    const [values, options] = this.queryArgs(args);
    this.debugData("all()", { sql, values, options });
    return this.engine.all(sql, values, options)
  }

  queryArgs(args) {
    const params = isArray(args[0])
      ? args.shift()
      : [ ];
    const options = args.length
      ? args.shift()
      : { };
    return [
      this.allValues(params),
      this.transact
        ? { ...options, transact: this.transact }
        : options
    ];
  }

  allValues(where=[]) {
    const wvalues = this.whereValues;
    const hvalues = this.havingValues;
    // In the usual case we just get one set of extra args and they
    // go at the end.  But if there's some need to jiggle the parameters
    // more then a function can be provided.
    if (isFunction(where)) {
      return where(wvalues, hvalues);
    }
    return [...wvalues, ...hvalues, ...where]
  }
}

export default Query
