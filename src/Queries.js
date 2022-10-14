import { fail } from "@abw/badger-utils";
import Query from "./Query.js";
import { addDebugMethod } from "./Utils/Debug.js";
import { missing } from "./Utils/Error.js";

const defaults = {
  maxExpansion: 16,
  fragments: { },
  queries:  { }
};

export class Queries {
  constructor(engine, config) {
    this.engine = engine || missing('engine');
    this.config = { ...defaults, ...config };

    //this.fragments = schema.fragments || { };
    //this.queries = schema.queries || { };
    //this.maxExpansion = schema.maxExpansion || defaults.maxExpansion;
    addDebugMethod(this, 'queries', this.config);
    this.debugData("config", { engine, config });
  }
  query(name) {
    return this.sql(name)
  }
  queryObject(name, config) {
    // new method
    const sql = this.sql(name);
    return new Query(sql, this.engine, config);
  }
  sql(name) {
    // if the name is a single word then it must be a named query, otherwise
    // we assume it's an SQL query possibly with embedded fragments.
    return this.expandFragments(
      name.match(/^\w+$/)
        ? this.config.queries[name] || fail("Invalid query specified: ", name)
        : name
    );
  }
  expandFragments(query) {
    const fragments = this.config.fragments;
    this.debugData("expandFragments()", { fragments })
    query = query.trim();
    let sql = query;
    let max = this.config.maxExpansion;
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
      if (++runaway >= max) {
        fail(
          "Maximum SQL expansion limit (maxExpansion=", max, ") exceeded: ",
          expanded.join(' -> ', )
        )
      }
    }
    this.debugData("expandFragments()", { query, sql });
    return sql;
  }
}

export default Queries