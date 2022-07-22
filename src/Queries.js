import { addDebug, fail } from "@abw/badger";

export class Queries {
  constructor(spec) {
    this.fragments = spec.fragments || { };
    this.queries = spec.queries || { };
    addDebug(this, spec.debug, spec.debugPrefix || 'Queries', spec.debugColor);
  }
  expandFragments(query) {
    const fragments = this.fragments;
    let sql = query;
    let runaway = 16;
    this.debug("Expanding fragments: ", sql);

    while (runaway > 0) {
      let replaced = false;
      sql = sql.replace(
        /<(\w+?)>/g,
        (match, word) => {
          replaced = true;
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
      runaway--;
    }
    return sql;
  }
}

export default Queries