import Database from 'better-sqlite3';
import Driver from '../../Driver.js';
import Query from './Query.js';
import { missing } from '../../Utils.js';
import { addDebug } from '@abw/badger';

// import sqlite3 from 'sqlite3';
// const Database = sqlite3.Database;
// console.log('sqlite3: ', sqlite3);

export class SqliteDriver extends Driver {
  configure(config) {
    this.filename = config.filename || missing('filename');
    this.options  = config.options  || { };
    addDebug(this, config.debug, config.debugPrefix || 'SqliteDriver> ', config.debugColor || 'red');
  }
  async connect() {
    this.debug("connect");
    return new Database(this.filename, this.options);
  }
  async connected(db) {
    this.debug("connected");
    return db.open;
  }
  async disconnect(db) {
    this.debug("disconnect");
    db.close();
  }
  async query(db, sql) {
    const query = await db.prepare(sql);
    return new Query(query);
  }
}

export default SqliteDriver