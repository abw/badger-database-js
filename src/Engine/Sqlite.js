import Engine from '../Engine.js';
import { missing, throwEngineDriver } from '../Utils/Error.js';
import { defaultIdColumn } from '../Constants'
import { remove } from '@abw/badger-utils';

export class SqliteEngine extends Engine {
  static driver   = 'better-sqlite3'
  static protocol = 'sqlite'

  configure(config) {
    // sqlite expects the filename first and then any options, so we copy
    // the database configuration into the options and then extract filename
    this.options  = { ...config.database };
    this.filename = remove(this.options, 'filename') || missing('filename');

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
    );
    return new Database(this.filename, this.options);
  }

  async connected(db) {
    return db.open;
  }

  async disconnect(db) {
    this.debug("disconnect()");
    db.close();
  }

  //-----------------------------------------------------------------------------
  // Query methods
  //-----------------------------------------------------------------------------
  async run(sql, ...args) {
    const [params, options] = this.queryArgs(args);
    this.debugData("run()", { sql, params, options });
    return this.execute(
      sql,
      query => query.run(...params),
      options
    );
  }

  async any(sql, ...args) {
    const [params, options] = this.queryArgs(args);
    this.debugData("any()", { sql, params, options });
    return this.execute(
      sql,
      query => query.get(...params),
      options
    );
  }

  async all(sql, ...args) {
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
  sanitizeResult(result, options={}) {
    result.changes ||= result.rowCount || 0;
    const keys = options.keys || [defaultIdColumn];
    const id = keys[0];
    result[id] ||= result.lastInsertRowid;
    result.id  ||= result.lastInsertRowid;
    return result;
  }
}

export default SqliteEngine