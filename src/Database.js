import Config from './Config.js'
import Connection from './Connection.js'
import modelProxy from './Proxy/Model.js';
import Table from './Table.js';
import Tables from './Tables.js';
import Queries from './Queries.js';
import { fail } from '@abw/badger-utils';

const escapeChars = {
  mysql:  '`',
  mysql2: '`',
  default: '"',
};
const defaults = {
  tablesClass: Tables
};

export class Database {
  constructor(params={ }) {
    const config    = { ...defaults, ...Config, ...params };
    this.connection = new Connection(config);
    this.queries    = new Queries(config);
    this.tables     = config.tablesObject || new config.tablesClass(config.tables);
    this.model      = modelProxy(this);
    this.escapeChar = escapeChars[config.client||'default'] || escapeChars.default;
    this.state      = {
      table: { },
    };
  }
  knex() {
    return this.connection.knex(...arguments);
  }
  raw() {
    return this.connection.raw(...arguments);
  }
  query(name) {
    return this.raw(this.queries.query(name));
  }
  table(name) {
    return this.state.table[name]
      ||=  this.initTable(name);
  }
  hasTable(name) {
    return this.tables.table(name);
  }
  initTable(name) {
    const schema = this.hasTable(name) || fail("Invalid table specified: " + name);
    const tclass = schema.tableClass   || Table;
    const topts  = schema.tableOptions || { };
    schema.table ||= name;
    return new tclass(this, { ...schema, ...topts });
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

export const database = config =>
  new Database(config)

export default Database

