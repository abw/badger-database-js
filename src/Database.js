import Table from './Table.js';
import Tables from './Tables.js';
import Queries from './Queries.js';
import proxymise from 'proxymise';
import modelProxy from './Proxy/Model.js';
import { engine } from './Engines.js';
import { invalid, missing } from './Utils/Error.js';
import { addDebugMethod } from './Utils/Debug.js';
import { databaseBuilder } from './Builders.js';

const defaults = {
  tablesClass: Tables
};

export class Database {
  constructor(engine, params={ }) {
    const config = { ...defaults, ...params };
    this.engine  = engine || missing('engine');
    this.queries = new Queries(config);
    this.tables  = config.tablesObject || new config.tablesClass(config.tables);
    this.model   = modelProxy(this);
    this.waiter  = proxymise(this);
    this.state   = {
      table: { },
    };
    addDebugMethod(this, 'database', config);
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
  query(name) {
    this.debugData("query()", { name });
    return this.queries.query(name);
  }
  run(query, params, options) {
    this.debugData("run()", { query, params, options });
    return this.engine.run(this.query(query), params, options)
  }
  any(query, params, options) {
    this.debugData("any()", { query, params, options });
    return this.engine.any(this.query(query), params, options)
  }
  all(query, params, options) {
    this.debugData("all()", { query, params, options });
    return this.engine.all(this.query(query), params, options)
  }
  one(query, params, options) {
    this.debugData("one()", { query, params, options });
    return this.engine.one(this.query(query), params, options)
  }
  async table(name) {
    return this.state.table[name]
      ||=  this.initTable(name);
  }
  hasTable(name) {
    return this.tables.table(name);
  }
  initTable(name) {
    const schema = this.hasTable(name) || invalid('table', name);
    const tclass = schema.tableClass   || Table;
    const topts  = schema.tableOptions || { };
    schema.table ||= name;
    return new tclass(this, { ...schema, ...topts });
  }
  quote(name) {
    return this.engine.quote(name);
  }
  builder() {
    return databaseBuilder(this);
  }
  select(...args) {
    return this.builder().select(...args);
  }
  from(...args) {
    return this.builder().from(...args);
  }
  disconnect() {
    return this.engine.destroy();
  }
  destroy() {
    console.log('destroy() is deprecated, use disconnect() instead');
    return this.disconnect();
  }
}

export const connect = config => {
  const e = engine(config);
  return new Database(e, config)
}

export default Database

