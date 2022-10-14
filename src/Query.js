import { isFunction } from "@abw/badger-utils";
import { addDebugMethod } from "./Utils/Debug.js";
import { missing } from "./Utils/Error.js";

export class Query {
  constructor(engine, query, config={}) {
    this.engine       = engine || missing('engine');
    this.query        = query;
    this.whereValues  = config.whereValues || [ ];
    this.havingValues = config.havingValues || [ ];
    addDebugMethod(this, 'query', this.config);
    // this.debugData("constructor()", { query, ...config })
  }

  sql() {
    return this.query;
  }

  run(params, options) {
    const sql    = this.sql();
    const values = this.allValues(params);
    this.debugData("run()", { sql, values, options });
    return this.engine.run(sql, values, options)
  }

  any(params, options) {
    const sql    = this.sql();
    const values = this.allValues(params);
    this.debugData("any()", { sql, values, options });
    return this.engine.any(sql, values, options)
  }

  all(params, options) {
    const sql    = this.sql();
    const values = this.allValues(params);
    this.debugData("all()", { sql, values, options });
    return this.engine.all(sql, values, options)
  }

  one(params, options) {
    const sql    = this.sql();
    const values = this.allValues(params);
    this.debugData("one()", { sql, values, options });
    return this.engine.one(sql, values, options)
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
