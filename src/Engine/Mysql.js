import mysql from 'mysql2/promise';
import Engine from '../Engine.js';
import { missing } from '../Utils.js';

export class SqliteEngine extends Engine {
  configure(config) {
    this.connection = config.connection || missing('connection');
    config.debugPrefix ||= 'MysqlEngine> ';
    return config;
  }

  //-----------------------------------------------------------------------------
  // Pool connections methods
  //-----------------------------------------------------------------------------
  async connect() {
    this.debug("connect: ", this.connection);
    return mysql.createConnection(this.connection);
  }
  async connected() {
    this.debug("connected");
    return true;
  }
  async disconnect(connection) {
    this.debug("disconnect");
    connection.destroy();
  }

  //-----------------------------------------------------------------------------
  // Query methods
  //-----------------------------------------------------------------------------
  async run(sql, ...params) {
    return this
      .execute(sql, query => query.execute(params))
      .then( ([result]) => result );
  }
  async any(sql, ...params) {
    return this
      .execute(sql, query => query.execute(params))
      .then( ([rows]) => rows[0] );
  }
  async all(sql, ...params) {
    return this
      .execute(sql, query => query.execute(params))
      .then( ([rows]) => rows );
  }
}

export default SqliteEngine