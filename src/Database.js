import Queryable from './Queryable.js';
import Table from './Table.js';
import Tables from './Tables.js';
import Transaction from "./Transaction.js";
import proxymise from 'proxymise';
import modelProxy from './Proxy/Model.js';
import { engine } from './Engines.js';
import { addDebugMethod } from './Utils/index.js';
import { databaseBuilder } from './Builders.js';
import { fail } from '@abw/badger-utils';

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
    addDebugMethod(this, 'database', config);
  }

  tmpId() {
    return 'database';
  }

  //-----------------------------------------------------------------------------
  // acquire/release a connection from the engine
  //-----------------------------------------------------------------------------
  acquire() {
    return this.engine.acquire();
  }
  release(connection) {
    this.engine.release(connection);
  }

  //-----------------------------------------------------------------------------
  // Tables
  //-----------------------------------------------------------------------------
  async table(name, options={}) {
    if (options.nocache) {
      //console.log(green('creating new table (nocache is set)'));
      //console.log('database (%s) is proxy? %s', this.tmpId(), this.isProxy ? green('YES') : red('NO'));
      return await this.initTable(name);
    }
    return this.state.table[name]
      ||= await this.initTable(name);
  }
  async hasTable(name) {
    return await this.tables.table(name);
  }
  async initTable(name) {
    const schema = await this.hasTable(name) || fail(`Invalid table specified: ${name}`);
    const tclass = schema.tableClass   || Table;
    const topts  = schema.tableOptions || { };
    schema.table ||= name;
    return new tclass(this, { ...schema, ...topts });
  }

  //-----------------------------------------------------------------------------
  // Query builder
  //-----------------------------------------------------------------------------
  select(...args) {
    return this.build.select(...args);
  }
  insert(...args) {
    return this.build.insert(...args);
  }
  update(...args) {
    return this.build.update(...args);
  }
  delete(...args) {
    return this.build.delete(...args);
  }

  //-----------------------------------------------------------------------------
  // Transactions
  //-----------------------------------------------------------------------------
  async transaction(code, config) {
    const trans = new Transaction(this, config);
    await trans.run(code);
  }

  //-----------------------------------------------------------------------------
  // Delegates to engine methods
  //-----------------------------------------------------------------------------
  quote(name) {
    return this.engine.quote(name);
  }
  disconnect() {
    return this.engine.destroy();
  }
}

export const connect = config => {
  const e = engine(config);
  return new Database(e, config)
}

export default Database

