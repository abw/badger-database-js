import Database from 'better-sqlite3';
import Engine from '../Engine.js';
import { missing } from '../Utils.js';

export class SqliteEngine extends Engine {
  configure(config) {
    this.filename = config.filename || missing('filename');
    this.options  = config.options  || { };
    config.debugPrefix ||= 'SqliteEngine> ';
    return config;
  }

  //-----------------------------------------------------------------------------
  // Pool connections methods
  //-----------------------------------------------------------------------------
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

  //-----------------------------------------------------------------------------
  // Query methods
  //-----------------------------------------------------------------------------
  async prepare(connection, sql) {
    return await connection.prepare(sql);
  }
  async run(sql, ...params) {
    return await this.execute(sql, query => query.run(...params));
  }
  async any(sql, ...params) {
    return await this.execute(sql, query => query.get(...params));
  }
  async all(sql, ...params) {
    return await this.execute(sql, query => query.all(...params));
  }
}

export default SqliteEngine