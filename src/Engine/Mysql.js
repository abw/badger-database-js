import mysql from 'mysql2/promise';
import Engine from '../Engine.js';
import { defaultIdColumn } from '../Constants.js';

export class MysqlEngine extends Engine {
  //-----------------------------------------------------------------------------
  // Pool connections methods
  //-----------------------------------------------------------------------------
  async connect() {
    this.debug(
      "connect()\n  database: %o",
      this.database
    );
    return mysql.createConnection(this.database);
  }
  async connected() {
    return true;
  }
  async disconnect(connection) {
    this.debug("disconnect()");
    connection.destroy();
  }

  //-----------------------------------------------------------------------------
  // Query methods
  //-----------------------------------------------------------------------------
  async run(sql, params, options) {
    this.debug(
      "run()\n       sql: %s\n    params: %o\n   options: %o",
      sql, params, options
    );
    [params, options] = this.optionalParams(params, options);
    return this
      .execute(sql, query => query.execute(params), options)
      .then( ([result]) => result );
  }
  async any(sql, params, options) {
    this.debug(
      "any()\n       sql: %s\n    params: %o\n   options: %o",
      sql, params, options
    );
    return this
      .execute(sql, query => query.execute(params), options)
      .then( ([rows]) => rows[0] );
  }
  async all(sql, params, options) {
    this.debug(
      "all()\n       sql: %s\n    params: %o\n   options: %o",
      sql, params, options
    );
    return this
      .execute(sql, query => query.execute(params), options)
      .then( ([rows]) => rows );
  }

  //-----------------------------------------------------------------------------
  // Query formatting
  //-----------------------------------------------------------------------------
  sanitizeResult(result, options={}) {
    const keys = options.keys || [defaultIdColumn];
    const id = keys[0];
    result[0].changes ||= result[0].affectedRows || 0;
    result[0].id      ||= result[0].insertId || null;
    result[0][id]     ||= result[0].insertId || null;
    return result;
  }
}

export default MysqlEngine