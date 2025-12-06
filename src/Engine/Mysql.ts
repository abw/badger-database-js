import Engine from '../Engine'
import { backtick, defaultIdColumn, COMMIT, ROLLBACK, BEGIN } from '../Constants'
import { missing, throwEngineDriver } from '../Utils/Error'
import { QueryArgs, SanitizeResultOptions } from '../types'
import Transaction from '../Transaction'

// Dummy types for MysqlClient and its connection property
type MysqlConnection = {
  _closing?: boolean
  _badger_veryNaughtyBoy?: boolean
}
type MysqlClient = {
  open: boolean
  connection?: MysqlConnection
  prepare: (sql: string) => Promise<MysqlClient>
  destroy(): void
}

export class MysqlEngine extends Engine<MysqlClient> {
  static driver     = 'mysql2/promise'
  static protocol   = 'mysql'
  static alias      = 'maria mariadb'
  static quoteChar  = backtick
  static beginTrans = 'START TRANSACTION'

  configure(config) {
    if (! config.database) {
      missing('database')
    }
    return config;
  }

  //-----------------------------------------------------------------------------
  // Pool connections methods
  //-----------------------------------------------------------------------------
  async connect() {
    this.debugData("connect()", { database: this.database });
    const { default: mysql } = await import(this.driver).catch(
      e => throwEngineDriver(this.driver, e)
    );
    return await mysql.createConnection(this.database) as MysqlClient;
  }

  connected(client: MysqlClient) {
    // work-around for https://github.com/sidorares/node-mysql2/issues/939
    const connection = client?.connection || { }
    return ! (connection._closing || connection._badger_veryNaughtyBoy);
  }

  async disconnect(client: MysqlClient) {
    this.debug("disconnect()");
    client.destroy();
  }

  //-----------------------------------------------------------------------------
  // Low-level execute method - with hack to catch jammed connections
  //-----------------------------------------------------------------------------
  async clientExecute(
    client: MysqlClient,
    sql: string,
    action: (client: MysqlClient) => any
  ) {
    try {
      const query = await client.prepare(sql)
      return await action(query)
    }
    catch (e) {
      // Hack to work around connection with errors getting jammed
      client.connection._badger_veryNaughtyBoy = true
      throw(e)
    }
  }

  //-----------------------------------------------------------------------------
  // Query methods
  //-----------------------------------------------------------------------------
  async run(
    sql: string,
    ...args: QueryArgs
  ) {
    const [params, options] = this.queryArgs(args);
    this.debugData("run()", { sql, params, options });
    return this
      .execute(
        sql,
        query => query.execute(params).then(([result]) => result),
        options
      )
  }

  async any(
    sql: string,
    ...args: QueryArgs
  ) {
    const [params, options] = this.queryArgs(args);
    this.debugData("any()", { sql, params, options });
    return this
      .execute(
        sql,
        query => query.execute(params).then(([rows]) => rows[0]),
        options
      )
  }

  async all(
    sql: string,
    ...args: QueryArgs
  ) {
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
  async begin(transact: Transaction) {
    this.debug('begin()')
    return await transact.connection.query(BEGIN)
  }

  async commit(transact: Transaction) {
    this.debug('commit()');
    return await transact.connection.query(COMMIT);
  }

  async rollback(transact: Transaction) {
    this.debug('rollback()');
    return await transact.connection.query(ROLLBACK);
  }

  //-----------------------------------------------------------------------------
  // Query formatting
  //-----------------------------------------------------------------------------
  sanitizeResult(
    result: any,
    options: SanitizeResultOptions = { }
  ) {
    const keys = options.keys || [defaultIdColumn];
    const id = keys[0];
    result.changes ||= result.affectedRows || 0;
    result.id      ||= result.insertId || null;
    result[id]     ||= result.insertId || null;
    return result;
  }
}

export default MysqlEngine