import Engine from '../Engine'
import { defaultIdColumn } from '../Constants'
import { missing, throwEngineDriver } from '../Utils/Error'
import { QueryArgs, SanitizeResultOptions } from '../types'

export type SqliteClient = {
  open: boolean
  close(): void
}

export class SqliteEngine extends Engine<SqliteClient> {
  static driver   = 'better-sqlite3'
  static protocol = 'sqlite'

  filename: string

  configure(config) {
    console.log(`config: `, config);

    // sqlite expects the filename first and then any options, so we copy
    // the database configuration into the options and then extract filename
    // console.log(`sqlite config: `, config)

    this.filename = config.filename || missing('filename')
    // this.filename = remove(config, 'filename') || missing('filename')
    // this.options  = { ...config.database };
    // this.filename = remove(config, 'filename') || missing('filename');

    // better-sqlite3 is synchronous (because Sqlite serialises all
    // requests anyway), so there's no need/benefit in using a pool
    config.pool     ||= { };
    config.pool.min ||= 1;
    config.pool.max ||= 1;

    return config;
  }

  //-----------------------------------------------------------------------------
  // Pool connections methods
  //-----------------------------------------------------------------------------
  async connect() {
    this.debugData("connect()", { filename: this.filename, options: this.options });
    const { default: Database } = await import(this.driver).catch(
      e => throwEngineDriver(this.driver, e)
    )
    return new Database(this.filename, this.options) as SqliteClient
  }

  connected(db: SqliteClient) {
    return db.open
  }

  async disconnect(db: SqliteClient) {
    this.debug("disconnect()");
    db.close()
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
    return this.execute(
      sql,
      query => query.run(...params),
      options
    );
  }

  async any(
    sql: string,
    ...args: QueryArgs
  ) {
    const [params, options] = this.queryArgs(args);
    this.debugData("any()", { sql, params, options });
    return this.execute(
      sql,
      query => query.get(...params),
      options
    );
  }

  async all(
    sql: string,
    ...args: QueryArgs
  ) {
    const [params, options] = this.queryArgs(args);
    this.debugData("all()", { sql, params, options });
    return this.execute(
      sql,
      query => query.all(...params),
      options
    );
  }

  //-----------------------------------------------------------------------------
  // Query formatting
  //-----------------------------------------------------------------------------
  sanitizeResult(
    result: any,
    options: SanitizeResultOptions = { }
  ) {
    result.changes ||= result.rowCount || 0;
    const keys = options.keys || [defaultIdColumn];
    const id = keys[0];
    result[id] ||= result.lastInsertRowid;
    result.id  ||= result.lastInsertRowid;
    return result;
  }
}

export default SqliteEngine