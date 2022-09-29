import mysql from 'mysql2/promise';
import Engine from '../Engine.js';

export class MysqlEngine extends Engine {
  configure(config) {
    config.debugPrefix ||= 'MysqlEngine> ';
    return config;
  }

  //-----------------------------------------------------------------------------
  // Pool connections methods
  //-----------------------------------------------------------------------------
  async connect() {
    this.debug("connect: ", this.engine);
    return mysql.createConnection(this.engine);
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
  async run(sql, params) {
    return this
      .execute(sql, query => query.execute(params))
      .then( ([result]) => result );
  }
  async any(sql, params) {
    return this
      .execute(sql, query => query.execute(params))
      .then( ([rows]) => rows[0] );
  }
  async all(sql, params) {
    return this
      .execute(sql, query => query.execute(params))
      .then( ([rows]) => rows );
  }
  sanitizeResult(result) {
    result[0].changes ||= result[0].affectedRows || 0;
    result[0].id      ||= result[0].insertId || null;
    return result;
  }
}

export default MysqlEngine