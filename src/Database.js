import { fail } from '@abw/badger-utils';
import Config from './Config.js'
import Connection from './Connection.js'
import Table from './Table.js';

class Database {
  constructor(params={ }) {
    const config    = { ...Config, ...params };
    this.connection = new Connection(config);
    this.tables     = config.tables || { };
    this.state      = {
      table: { },
    };
  }
  query() {
    return this.connection.query(...arguments);
  }
  raw() {
    return this.connection.raw(...arguments);
  }
  table(name) {
    return this.state.table[name]
      ||  (this.state.table[name] = this.initTable(name));
  }
  initTable(name) {
    const schema = this.tables[name] || fail("Invalid table specified: " + name);
    return new Table(this, schema);
  }
  destroy() {
    return this.connection.destroy();
  }
}

export const database = config => new Database(config)

export default Database

