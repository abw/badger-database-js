import pg from 'pg';
import Engine from '../Engine.js';
import { defaultIdColumn } from '../Constants.js';

export class PostgresEngine extends Engine {
  static protocol = 'postgres'
  static protocolAlias = 'postgresql'

  //-----------------------------------------------------------------------------
  // Pool connections methods
  //-----------------------------------------------------------------------------
  async connect() {
    this.debugData("connect()", { database: this.database });
    const client = new pg.Client(this.database);
    await client.connect();
    return client;
  }
  async connected() {
    return true;
  }
  async disconnect(client) {
    this.debug("disconnect()");
    client.end();
  }

  //-----------------------------------------------------------------------------
  // Query methods
  //-----------------------------------------------------------------------------
  async execute(sql, params, options={}) {
    this.debugData("execute()", { sql, params, options });
    const client = await this.acquire();
    try {
      const result = await client.query(sql, params).catch( e => this.parseError(sql, e) );
      return options.sanitizeResult
        ? this.sanitizeResult(result, options)
        : result;
    }
    finally {
      this.release(client);
    }
  }
  async run(sql, params, options) {
    this.debugData("run()", { sql, params, options });
    [params, options] = this.optionalParams(params, options);
    return this
      .execute(sql, params, options)
  }
  async any(sql, params, options) {
    this.debugData("any()", { sql, params, options });
    return this
      .execute(sql, params, options)
      .then( ({rows}) => rows[0] );
  }
  async all(sql, params, options) {
    this.debugData("all()", { sql, params, options });
    return this
      .execute(sql, params, options)
      .then( ({rows}) => rows );
  }
  parseErrorArgs(e) {
    return {
      message:  e.message,
      type:     e.severity,
      code:     e.code,
      position: e.position,
    };
  }
  //-----------------------------------------------------------------------------
  // Query formatting
  //-----------------------------------------------------------------------------
  sanitizeResult(result, options={}) {
    // console.log('sanitizeResult() result: ', result);
    // console.log('sanitizeResult() options: ', options);
    result.changes ||= result.rowCount || 0;
    if (result.command === 'INSERT' && result.rows?.length) {
      const keys = options.keys || [defaultIdColumn];
      keys.forEach(
        key => result[key] ||= result.rows[0][key]
      )
      result.id ||= result[keys[0]];
    }
    return result;
  }
  formatPlaceholder(n) {
    return '$' + n;
  }
  formatReturning(keys) {
    return ' RETURNING ' + this.formatColumns(keys);
  }
}

export default PostgresEngine