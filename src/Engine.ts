import { Pool } from 'tarn'
import { hasValue, isArray, isObject, ListSource, splitList } from '@abw/badger-utils'
import {
  allColumns, doubleQuote, equals, whereTrue, BEGIN, COMMIT, ROLLBACK
} from './Constants'
import {
  missing, SQLParseError, unexpectedRowCount, addDebugMethod, DebugConfig
} from "./Utils/index"
import {
  DatabaseConnection, EngineConfig, EngineOptions, ExecuteOptions, QueryArgs, QueryOptions,
  QueryParams, QueryRow, SanitizeResultOptions, TransactionInstance
} from './types'

// const notImplemented = notImplementedInBaseClass('Engine')

const poolDefaults = {
  min: 2,
  max: 10,
  propagateCreateError: true
}

export type AnyClient = any

export abstract class Engine<Client=AnyClient> {
  static driver: string | null = null
  static quoteChar  = doubleQuote
  static returning  = false
  static protocol?: string
  static alias?: string

  engine: string
  options: EngineOptions
  database: Omit<DatabaseConnection, 'engine'>
  driver: string
  quoteChar: string
  returning: boolean
  pool: Pool<unknown>
  escQuote: string
  debug!: (message: string) => void
  debugData!: (message: string, data: any) => void

  constructor(config: EngineConfig) {
    const {
      engine,
      pool = { },
      options = { },
      ...connect
    } = this.configure(config)
    /*
    console.log(`Engine engine:`, engine)
    console.log(`Engine pool:`, pool)
    console.log(`Engine options:`, options)
    console.log(`Engine connect:`, connect)
    */

    this.engine    = engine || missing('engine');
    this.options   = options
    this.database  = { ...connect, ...options }
    this.driver    = (this.constructor as typeof Engine).driver || missing('driver');
    this.quoteChar = (this.constructor as typeof Engine).quoteChar;
    this.returning = (this.constructor as typeof Engine).returning;
    // this.messages  = this.constructor.messages;
    this.pool      = this.initPool(pool);
    this.escQuote  = `\\${this.quoteChar}`;
    addDebugMethod(this, 'engine', config);
  }
  configure(config: EngineConfig) {
    return config;
  }

  //-----------------------------------------------------------------------------
  // Pool configuration
  //-----------------------------------------------------------------------------
  // TODO: add a generic type so that subclasses can have typed client connections
  initPool(options={}) {
    return new Pool<Client>({
      create: () => {
        this.debug("connecting to pool")
        return this.connect()
      },
      validate: client => {
        return this.connected(client)
      },
      destroy: client => {
        this.debug("disconnecting from pool")
        return this.disconnect(client)
      },
      ...poolDefaults,
      ...options
    });
  }

  //-----------------------------------------------------------------------------
  // Pool connections methods - must be implemented by subclasses
  //-----------------------------------------------------------------------------
  abstract connect(): Promise<Client>
  abstract disconnect(_client: Client): void
  connected(_client: Client) {
    return true
  }

  //-----------------------------------------------------------------------------
  // Methods to acquire and release connections from the pool
  //-----------------------------------------------------------------------------
  async acquire(): Promise<Client> {
    this.debug("acquire()")
    return this.pool.acquire().promise as Promise<Client>
  }

  async release(connection: Client) {
    this.debug("release()");
    // await this.pool.release(connection);
    this.pool.release(connection);
  }

  //-----------------------------------------------------------------------------
  // Query execution methods
  //-----------------------------------------------------------------------------
  async clientExecute(
    client: any,      // yuk
    sql: string,
    action: (query: any) => unknown
  ) {
    const query = await client.prepare(sql)
    return await action(query);
  }

  async execute(
    sql: string,
    action: (query: any) => unknown,
    options: ExecuteOptions = { }
  ) {
    this.debugData("execute()", { sql, options });

    // if we have a transaction in effect then we use the transaction's
    // connection otherwise we fetch one from the pool
    const transact = options.transact
    const client = transact
      ? transact.connection
      : await this.acquire()

    try {
      // run the query
      const result = await this
        .clientExecute(client, sql, action)
        .catch( e => this.parseError(sql, e) );

      // sanitize the result
      return options.sanitizeResult
        ? this.sanitizeResult(result, options)
        : result;
    }
    finally {
      // release the connection back to the pool if it's one we acquired
      if (! transact) {
        await this.release(client);
      }
    }
  }

  //-----------------------------------------------------------------------------
  // Generic query methods - most must be defined by subclasses
  //-----------------------------------------------------------------------------
  abstract run(
    sql: string,
    ...args: QueryArgs
  ): Promise<any>

  abstract any<T=QueryRow>(
    sql: string,
    ...args: QueryArgs
  ): Promise<T|undefined>

  abstract all<T=QueryRow>(
    sql: string,
    ...args: QueryArgs
  ): Promise<T[]>

  async one<T=QueryRow>(
    sql: string,
    ...args: QueryArgs
  ) {
    const [params, options] = this.queryArgs(args);
    this.debugData("one()", { sql, params, options });
    const rows = await this.all<T>(sql, params, options);
    if (rows.length === 1) {
      return rows[0];
    }
    else {
      unexpectedRowCount(rows.length);
    }
  }

  //-----------------------------------------------------------------------------
  // Transaction queries
  //-----------------------------------------------------------------------------
  async begin(transact: TransactionInstance) {
    this.debug('begin()')
    return await this.run(BEGIN, { transact })
  }

  async commit(transact: TransactionInstance) {
    this.debug('commit()');
    return await this.run(COMMIT, { transact });
  }

  async rollback(transact: TransactionInstance) {
    this.debug('rollback()');
    return await this.run(ROLLBACK, { transact });
  }

  //-----------------------------------------------------------------------------
  // Query utility methods
  //-----------------------------------------------------------------------------
  parseError(sql: string, e: any) {
    throw new SQLParseError(sql, this.parseErrorArgs(e));
  }

  parseErrorArgs(e) {
    return {
      message:  e.message,
      type:     e.code,
      code:     e.errno,
      position: e.position,
    };
  }

  queryArgs(
    args?: QueryArgs
  ): [QueryParams, QueryOptions] {
    const params: QueryParams = isArray(args[0])
      ? args.shift() as QueryParams
      : [ ];
    const options: QueryOptions = args.length
      ? args.shift()
      : { };
    return [params, options];
  }

  prepareValues(
    values: Array<any|any[]>
  ) {
    return values.map(
      // values can be arrays with a comparison, e.g. ['>', 1973], in which case
      // we only want the second element
      value => isArray(value)
        ? value[1]
        : value
    )
  }

  sanitizeResult(
    result: any,
    _options: SanitizeResultOptions
  ) {
    return result;
  }

  //-----------------------------------------------------------------------------
  // Query formatting
  //-----------------------------------------------------------------------------
  quote(
    name: string | { sql?: string }
  ) {
    if (isObject(name) && name.sql) {
      return name.sql;
    }
    return (name as string)
      .split(/\./)
      .map(
        part => part === allColumns
          ? part
          : this.quoteChar + part.replaceAll(this.quoteChar, this.escQuote) + this.quoteChar)
      .join('.');
  }

  quoteTableColumn(
    table: string,
    column: string
  ) {
    // if the column already has a dot then we quote it as is,
    // otherwise we explicitly add the table name
    return column.match(/\./)
      ? this.quote(column)
      : this.quote(`${table}.${column}`);
  }

  formatPlaceholder(
    _n: number
  ) {
    return '?';
  }

  formatColumnPlaceholder(
    column: string,
    n: number
  ) {
    return `${this.quote(column)}=${this.formatPlaceholder(n)}`;
  }

  formatWherePlaceholder(
    column: string,
    value: any | [string, any],
    n: number
  ) {
    // value can be an array containing a comparison operator and a value,
    // e.g. ['>' 1973], otherwise we assume it's an equality operator, '='
    const cmp = isArray(value) ? value[0] : equals;
    return `${this.quote(column)} ${cmp} ${this.formatPlaceholder(n)}`;
  }

  formatWhereInPlaceholder(
    column: string,
    operator: string,
    values: any[],
    n: number
  ) {
    const placeholders = values.map(
      (_v, i) => this.formatPlaceholder(n + i)
    )
    return `${this.quote(column)} ${operator} (${placeholders})`;
  }

  formatWhereNull(column: string) {
    return `${this.quote(column)} is NULL`;
  }

  formatWhereNotNull(column: string) {
    return `${this.quote(column)} is not NULL`;
  }

  formatSetPlaceholder(column: string, n: number) {
    return `${this.quote(column)} ${equals} ${this.formatPlaceholder(n)}`;
  }

  formatPlaceholders(
    values: any[],
    n=1
  ) {
    return values.map(
      () => this.formatPlaceholder(n++)
    ).join(', ');
  }

  formatColumnPlaceholders(
    columns: string[],
    n=1,
    joint=', '
  ) {
    return columns.map(
      column => this.formatColumnPlaceholder(column, n++)
    ).join(joint);
  }

  formatWherePlaceholders(
    columns: string[],
    values: any[],
    n=1,
    joint=' AND '
  ) {
    let i = 0;
    return columns.map(
      column => this.formatWherePlaceholder(column, values[i++], n++)
    ).join(joint) || whereTrue;
  }

  formatColumns(
    columns: string | { sql?: string }
  ) {
    if (isObject(columns) && columns.sql) {
      return columns.sql;
    }
    return hasValue(columns)
      ? splitList(columns as ListSource)
        .map(
          column => this.quote(column)
        )
        .join(', ')
      : allColumns;
  }

  //-----------------------------------------------------------------------------
  // Cleanup
  //-----------------------------------------------------------------------------
  async destroy() {
    this.debug("destroy()");
    await this.pool.destroy();
  }
}

export default Engine
