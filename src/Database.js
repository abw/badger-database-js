import { fail } from '@abw/badger-utils';
import Config from './Config.js'
import Connection from './Connection.js'
import Table from './Table.js';

const escapeChars = {
  mysql:  '`',
  mysql2: '`',
  default: '"',
};

class Database {
  constructor(params={ }) {
    const config    = { ...Config, ...params };
    this.connection = new Connection(config);
    this.tables     = config.tables || { };
    this.escapeChar = escapeChars[config.client||'default'] || escapeChars.default;
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
    schema.table ||= name;
    return new Table(this, schema);
  }
  escape(name) {
    return name
      .split(/\./)
      .map( part => this.escapeChar + part + this.escapeChar)
      .join('.');
  }
  destroy() {
    return this.connection.destroy();
  }
}

export const database = config => new Database(config)

export default Database

