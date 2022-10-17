import Engine from '../Engine.js';
import { missing, throwEngineDriver } from '../Utils/Error.js';
import { defaultIdColumn } from '../Constants.js';

export class SqliteEngine extends Engine {
  static name = 'sqlite'

  configure(config) {
    this.filename = config.database.filename || missing('filename');
    this.options  = config.database.options  || { };

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
    const { default: Database } = await import('better-sqlite3').catch(
      e => throwEngineDriver('better-sqlite3', e)
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
  async run(sql, params=[], options) {
    this.debugData("run()", { sql, params, options });
    [params, options] = this.optionalParams(params, options);
    return this.execute(sql, query => query.run(...params), options);
  }
  async any(sql, params=[], options) {
    this.debugData("any()", { sql, params, options });
    return this.execute(sql, query => query.get(...params), options);
  }
  async all(sql, params=[], options) {
    this.debugData("all()", { sql, params, options });
    return this.execute(sql, query => query.all(...params), options);
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