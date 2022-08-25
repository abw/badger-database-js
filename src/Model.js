import { fail } from "@abw/badger-utils";

class Model {
  constructor(config={}) {
    this.database = config.database || fail("No database specified");
    this.tables   = config.tables   || { };
  }
}

export default Model
