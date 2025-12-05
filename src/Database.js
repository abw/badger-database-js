import Queryable from './Queryable.js';
import Table from './Table.js';
import Tables from './Tables.js';
import Transaction from "./Transaction.js";
import proxymise from 'proxymise';
import modelProxy from './Proxy/Model.js';
import { engine } from './Engines.js';
import { addDebugMethod } from './Utils/index';
import { databaseBuilder } from './Builders.js';
import { fail } from '@abw/badger-utils';

const defaults = {
  tablesClass: Tables
};

export class Database extends Queryable {
  constructor(engine, config={}) {
    super(engine, config);
    this.config    = config = { ...defaults, ...config };
    this.queries   = config.queries;
    this.fragments = config.fragments;
    this.tables    = config.tablesObject || new config.tablesClass(config.tables);
    this.initDatabase(config)
    addDebugMethod(this, 'database', config);
  }
  initDatabase() {
    // We do this part separately so that we can call this method when
    // we create a transaction, allowing it to create wrappers around
    // the new "this" that has the transaction stored in it
    this.build     = databaseBuilder(this);
    this.model     = modelProxy(this);
    this.waiter    = proxymise(this);
    this.state     = {
      // tables must be created afresh to ensure they get the
      // transaction reference
      table: { },
    };
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
    return this.state.table[name]
      ||= await this.initTable(name, options);
  }
  async hasTable(name) {
    return await this.tables.table(name);
  }
  async initTable(name, options) {
    const schema   = await this.hasTable(name) || fail(`Invalid table specified: ${name}`);
    const tclass   = schema.tableClass   || Table;
    const topts    = schema.tableOptions || { };
    const transact = this.transact;
    schema.table ||= name;
    return new tclass(
      this,
      { ...schema, ...topts, ...options, transact }
    );
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
    const transact = new Transaction(this.engine, config);
    const proxy = {
      transact,
      commit:   () => transact.commit(),
      rollback: () => transact.rollback(),
    };
    Object.setPrototypeOf(proxy, this);
    proxy.initDatabase()
    await transact.run(proxy, code);
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
  // console.log(`new Database: `, config)
  return new Database(e, config)
}

export default Database

