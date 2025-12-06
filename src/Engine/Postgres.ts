import Engine from '../Engine'
import { defaultIdColumn } from '../Constants'
import { throwEngineDriver } from '../Utils/Error'
import { QueryArgs, SanitizeResultOptions } from '../types'

// Dummy type for the postgres client
type PostgresClient = {
  connect(): Promise<void>
  end(): void
  connection?: any
}

export class PostgresEngine extends Engine<PostgresClient> {
  static driver    = 'pg'
  static protocol  = 'postgres'
  static alias     = 'postgresql'
  static returning = true

  //-----------------------------------------------------------------------------
  // Pool connections methods
  //-----------------------------------------------------------------------------
  async connect() {
    this.debugData("connect()", { database: this.database });
    const { default: pg } = await import(this.driver).catch(
      e => throwEngineDriver(this.driver, e)
    );
    const client = new pg.Client(this.database) as PostgresClient;
    await client.connect();
    return client;
  }

  async disconnect(client: PostgresClient) {
    this.debug("disconnect()");
    client.end();
  }

  //-----------------------------------------------------------------------------
  // Query methods
  //-----------------------------------------------------------------------------
  async clientExecute(
    client: PostgresClient,
    _sql: string,
    action: (client: PostgresClient) => any
  ) {
    // Postgres doesn't have a prepare stage
    return await action(client);
  }

  async run(
    sql: string,
    ...args: QueryArgs
  ) {
    const [params, options] = this.queryArgs(args);
    this.debugData("run()", { sql, params, options });
    return this.execute(
      sql,
      client => client.query(sql, params),
      options
    )
  }

  async any(
    sql: string,
    ...args: QueryArgs) {
    const [params, options] = this.queryArgs(args);
    this.debugData("any()", { sql, params, options });
    return this.execute(
      sql,
      client => client.query(sql, params).then(({rows}) => rows[0]),
      options
    )
  }

  async all(
    sql: string,
    ...args: QueryArgs
  ) {
    const [params, options] = this.queryArgs(args);
    this.debugData("all()", { sql, params, options });
    return this.execute(
      sql,
      client => client.query(sql, params).then(({rows}) => rows),
      options
    )
  }

  parseErrorArgs(e) {
    return {
      message:  e.message,
      type:     e.severity,
      code:     e.code,
      position: e.position,
    };
  }

  sanitizeResult(
    result: any,
    options: SanitizeResultOptions = { }
  ) {
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

  //-----------------------------------------------------------------------------
  // Query formatting
  //-----------------------------------------------------------------------------
  formatPlaceholder(n: number) {
    return '$' + n;
  }
}

export default PostgresEngine