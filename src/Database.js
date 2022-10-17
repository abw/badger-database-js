import Table from './Table.js';
import Tables from './Tables.js';
import proxymise from 'proxymise';
import modelProxy from './Proxy/Model.js';
import { engine } from './Engines.js';
import { invalid } from './Utils/Error.js';
import { addDebugMethod } from './Utils/Debug.js';
import { databaseBuilder } from './Builders.js';
import Queryable from './Queryable.js';

const defaults = {
  tablesClass: Tables
};

export class Database extends Queryable {
  constructor(engine, params) {
    super(engine);
    const config   = { ...defaults, ...params };
    this.queries   = config.queries;
    this.fragments = config.fragments;
    this.tables    = config.tablesObject || new config.tablesClass(config.tables);
    this.build     = databaseBuilder(this);
    this.model     = modelProxy(this);
    this.waiter    = proxymise(this);
    this.state     = {
      table: { },
    };
    //addQueryMethods(this);
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
  async table(name) {
    return this.state.table[name]
      ||= await this.initTable(name);
  }
  async hasTable(name) {
    return await this.tables.table(name);
  }
  async initTable(name) {
    const schema = await this.hasTable(name) || invalid('table', name);
    const tclass = schema.tableClass   || Table;
    const topts  = schema.tableOptions || { };
    schema.table ||= name;
    return new tclass(this, { ...schema, ...topts });
  }
  quote(name) {
    return this.engine.quote(name);
  }
  select(...args) {
    return this.build.select(...args);
  }
  from(...args) {
    return this.build.from(...args);
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

