import { fail } from "@abw/badger-utils";
import { notImplementedInBaseClass } from "./Utils.js";

const notImplemented = notImplementedInBaseClass('Query');

export class Query {
  async execute() {
    notImplemented("execute()")
  }
  async all() {
    notImplemented("all()")
  }
  async any() {
    notImplemented("any()")
  }
  async one(params) {
    const rows = await this.all(params);
    if (rows.length === 1) {
      return rows[0];
    }
    else if (rows.length === 0) {
      fail("No rows returned when one was expected");
    }
    else {
      fail(`${rows.length} rows returned when one was expected`);
    }
  }
}

export default Query