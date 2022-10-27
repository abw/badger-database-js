import Engine from '../Engine.js';
import { backtick, defaultIdColumn, COMMIT, ROLLBACK } from '../Constants.js';
import { throwEngineDriver } from '../Utils/Error.js';

export class MysqlEngine extends Engine {
  static driver     = 'mysql2/promise'
  static protocol   = 'mysql'
  static alias      = 'maria mariadb'
  static quoteChar  = backtick
  static beginTrans = 'START TRANSACTION'

  //-----------------------------------------------------------------------------
  // Pool connections methods
  //-----------------------------------------------------------------------------
  async connect() {
    this.debugData("connect()", { database: this.database });
    const { default: mysql } = await import(this.driver).catch(
      e => throwEngineDriver(this.driver, e)
    );
    return mysql.createConnection(this.database);
  }

  async disconnect(connection) {
    this.debug("disconnect()");
    connection.destroy();
  }

  //-----------------------------------------------------------------------------
  // Query methods
  //-----------------------------------------------------------------------------
  async run(sql, ...args) {
    const [params, options] = this.queryArgs(args);
    this.debugData("run()", { sql, params, options });
    return this
      .execute(
        sql,
        query => query.execute(params).then(([result]) => result),
        options
      )
  }

  async any(sql, ...args) {
    const [params, options] = this.queryArgs(args);
    this.debugData("any()", { sql, params, options });
    return this
      .execute(
        sql,
        query => query.execute(params).then(([rows]) => rows[0]),
        options
      )
  }

  async all(sql, ...args) {
    const [params, options] = this.queryArgs(args);
    this.debugData("all()", { sql, params, options });
    return this
      .execute(
        sql,
        query => query.execute(params).then(([rows]) => rows),
        options
      )
  }

  //-----------------------------------------------------------------------------
  // Transaction methods - MySQL requires special handling
  //-----------------------------------------------------------------------------
  async begin(transaction) {
    this.debug("begin() - START TRANSACTION")
    return await transaction.connection.query('START TRANSACTION')
  }

  async commit(transaction) {
    this.debug('commit() - ', COMMIT);
    return await transaction.connection.query(COMMIT);
  }

  async rollback(transaction) {
    this.debug('rollback() - ', ROLLBACK);
    return await transaction.connection.query(ROLLBACK);
  }

  //-----------------------------------------------------------------------------
  // Query formatting
  //-----------------------------------------------------------------------------
  sanitizeResult(result, options={}) {
    const keys = options.keys || [defaultIdColumn];
    const id = keys[0];
    result.changes ||= result.affectedRows || 0;
    result.id      ||= result.insertId || null;
    result[id]     ||= result.insertId || null;
    return result;
  }
}

export default MysqlEngine