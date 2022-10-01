import pg from 'pg';
import Engine from '../Engine.js';
import { defaultIdColumn } from '../Constants.js';

export class PostgresEngine extends Engine {
  configure(config) {
    config.debugPrefix ||= 'MysqlEngine> ';
    return config;
  }

  //-----------------------------------------------------------------------------
  // Pool connections methods
  //-----------------------------------------------------------------------------
  async connect() {
    this.debug("connect: ", this.database);
    const client = new pg.Client(this.database);
    await client.connect();
    return client;
  }
  async connected() {
    this.debug("connected");
    return true;
  }
  async disconnect(client) {
    this.debug("disconnect");
    client.end();
  }

  //-----------------------------------------------------------------------------
  // Query methods
  //-----------------------------------------------------------------------------
  async execute(sql, params, options={}) {
    this.debug("execute() ", sql);
    const client = await this.acquire();
    const result = await client.query(sql, params);
    this.release(client);
    return options.sanitizeResult
      ? this.sanitizeResult(result, options)
      : result;
  }
  async run(sql, params, options) {
    [params, options] = this.optionalParams(params, options);
    return this
      .execute(sql, params, options)
  }
  async any(sql, params, options) {
    return this
      .execute(sql, params, options)
      .then( ({rows}) => rows[0] );
  }
  async all(sql, params, options) {
    return this
      .execute(sql, params, options)
      .then( ({rows}) => rows );
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
  formatPlaceholders(values) {
    let n = 1;
    return values.map(() => '$' + n++).join(', ');
  }
  formatColumnPlaceholder(column, n) {
    return `${this.quote(column)}=$${n}`;
  }
  formatColumnPlaceholders(columns, joint=', ', n=1) {
    return columns.map(
      column => this.formatColumnPlaceholder(column, n++)
    ).join(joint);
  }
  formatReturning(keys) {
    return ' RETURNING ' + this.formatColumns(keys);
  }
}

export default PostgresEngine