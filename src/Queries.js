import { fail } from "@abw/badger-utils";
import { addDebugMethod } from "./Utils/Debug.js";

const defaults = {
  maxExpansion: 16,
  fragments: { },
  queries:  { }
};

export class Queries {
  constructor(schema) {
    const config = this.config = { ...defaults, ...schema };
    //this.fragments = schema.fragments || { };
    //this.queries = schema.queries || { };
    //this.maxExpansion = schema.maxExpansion || defaults.maxExpansion;
    addDebugMethod(this, 'queries', config);
  }
  query(name) {
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

export const queries = (schema) =>
  new Queries(schema)

export default Queries