import { fail, isFunction, isString } from "@abw/badger-utils";
import Builder from "./Builder.js";
import { singleWord } from "./Constants.js";
import Query from "./Query.js";
import { addDebugMethod } from "./Utils/Debug.js";
import { missing } from "./Utils/Error.js";

const defaults = {
  maxExpansion: 16,
  fragments: { },
  queries:  { }
};

export class Queries {
  constructor(parent, config) {
    this.parent = parent || missing('parent');
    this.engine = parent.engine || missing('engine');
    this.config = { ...defaults, ...config };

    //this.fragments = schema.fragments || { };
    //this.queries = schema.queries || { };
    //this.maxExpansion = schema.maxExpansion || defaults.maxExpansion;
    addDebugMethod(this, 'queries', this.config);
    // this.debugData("constructor", { engine, config });
  }
  sql(name) {
    return this.query(name).sql();
  }

  query(source, config) {
    let sql;

    if (source.match(singleWord)) {
      // if the source is a single word then it must be a named query
      let query = this.namedQuery(source);

      if (isString(query)) {
        // if we've got a string then expand any fragments
        sql = this.expandFragments(query);
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
      sql = this.expandFragments(source);
    }

    return new Query(this.engine, sql, config);
  }

  namedQuery(source) {
    let query = this.config.queries[source] || fail("Invalid named query specified: ", source);
    return isFunction(query)
      ? query(this.parent)
      : query;
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