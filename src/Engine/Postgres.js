import pg from 'pg';
import Engine from '../Engine.js';

export class PostgresEngine extends Engine {
  configure(config) {
    config.debugPrefix ||= 'MysqlEngine> ';
    return config;
  }

  //-----------------------------------------------------------------------------
  // Pool connections methods
  //-----------------------------------------------------------------------------
  async connect() {
    this.debug("connect: ", this.engine);
    const client = new pg.Client(this.engine);
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
  async execute(sql, params) {
    this.debug("execute() ", sql);
    const client = await this.acquire();
    const result = await client.query(sql, params);
    this.release(client);
    return this.sanitizeResult(result);
  }
  async run(sql, params) {
    return this
      .execute(sql, params)
  }
  async any(sql, params) {
    return this
      .execute(sql, params)
      .then( ({rows}) => rows[0] );
  }
  async all(sql, params) {
    return this
      .execute(sql, params)
      .then( ({rows}) => rows );
  }
  sanitizeResult(result) {
    result.changes ||= result.rowCount || 0;
    if (result.command === 'INSERT' && result.rows?.length) {
      result.id = result.rows[0].id;
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
    return ' RETURNING ' + keys.join(', ');
  }
}

export default PostgresEngine