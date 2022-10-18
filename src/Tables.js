import { isFunction } from "@abw/badger-utils";
import { addDebugMethod } from "./Utils/Debug.js";

export class Tables {
  constructor(tables={}) {
    this.tables = tables;
    addDebugMethod(this, 'tables');
  }
  async table(name) {
    const config = this.tables[name];
    if (isFunction(config) && isFunction(config.constructor)) {
      // table config can be a class
      return { tableClass: config };
    }
    return config;
  }
}

export default Tables;