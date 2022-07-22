import { addDebug, fail } from "@abw/badger";

const defaults = {
  maxExpansion: 16
};

export class Queries {
  constructor(spec) {
    this.fragments = spec.fragments || { };
    this.queries = spec.queries || { };
    this.maxExpansion = spec.maxExpansion || defaults.maxExpansion;
    addDebug(this, spec.debug, spec.debugPrefix || 'Queries', spec.debugColor);
  }
  expandFragments(query) {
    const fragments = this.fragments;
    let sql = query;
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
      if (++runaway >= this.maxExpansion) {
        fail(
          "Maximum SQL expansion limit (maxExpansion=", this.maxExpansion, ") exceeded: ",
          expanded.join(' -> ', )
        )
      }
    }
    return sql;
  }
}

export default Queries