import { addDebug } from "@abw/badger";
import { fail } from "@abw/badger-utils";

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
    addDebug(this, config.debug, config.debugPrefix || 'Queries', config.debugColor);
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
    this.debug("Expanding fragments: ", sql);

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
      if (replaced) {
        this.debug("Replaced: ", sql);
      }
      else {
        this.debug("No more replacements: ", sql);
        break;
      }
      if (++runaway >= max) {
        fail(
          "Maximum SQL expansion limit (maxExpansion=", max, ") exceeded: ",
          expanded.join(' -> ', )
        )
      }
    }
    return sql;
  }
}

export const queries = (schema) =>
  new Queries(schema)

export default Queries