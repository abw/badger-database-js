import Config from './Config.js'
import modelProxy from './Proxy/Model.js';
import Table from './Table.js';
import Tables from './Tables.js';
import Queries from './Queries.js';
import { engine } from './Engines.js';
import { fail } from '@abw/badger-utils';
import { missing } from './Utils/Error.js';

const defaults = {
  tablesClass: Tables
};

export class Database {
  constructor(engine, params={ }) {
    const config = { ...defaults, ...Config, ...params };
    this.engine  = engine || missing('engine');
    this.queries = new Queries(config);
    this.tables  = config.tablesObject || new config.tablesClass(config.tables);
    this.model   = modelProxy(this);
    this.state   = {
      table: { },
    };
  }

  //-----------------------------------------------------------------------------
  // Engine methods
  //-----------------------------------------------------------------------------
  acquire() {
    return this.engine.acquire();
  }
  release(connection) {
    this.engine.release(connection);
  }
  run(...params) {
    return this.engine.run(...params)
  }
  any(...params) {
    return this.engine.any(...params)
  }
  all(...params) {
    return this.engine.all(...params)
  }
  one(...params) {
    return this.engine.one(...params)
  }


  query(name) {
    return this.raw(this.queries.query(name));
  }
  async table(name) {
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
  quote(name) {
    return this.engine.quote(name);
  }
  destroy() {
    return this.engine.destroy();
  }
}

export const database = async config => {
  const e = await engine(config);
  return new Database(e, config)
}

export default Database

