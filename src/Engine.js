import { Pool } from 'tarn';
import { allColumns, doubleQuote, equals, whereTrue, BEGIN, COMMIT, ROLLBACK } from './Constants.js';
import { missing, notImplementedInBaseClass, SQLParseError, unexpectedRowCount, addDebugMethod } from "./Utils/index.js";
import { hasValue, isArray, isObject, splitList } from '@abw/badger-utils';

const notImplemented = notImplementedInBaseClass('Engine');

const poolDefaults = {
  min: 2,
  max: 10,
  propagateCreateError: true
}

export class Engine {
  static quoteChar  = doubleQuote
  static returning  = false

  constructor(config={}) {
    this.engine    = config.engine || missing('engine');
    this.database  = config.database || missing('database');
    this.driver    = this.constructor.driver || missing('driver');
    this.quoteChar = this.constructor.quoteChar;
    this.returning = this.constructor.returning;
    this.messages  = this.constructor.messages;
    this.config    = this.configure(config);
    this.pool      = this.initPool(config.pool);
    this.escQuote  = `\\${this.quoteChar}`;
    addDebugMethod(this, 'engine', config);
  }
  configure(config) {
    return config;
  }

  //-----------------------------------------------------------------------------
  // Pool configuration
  //-----------------------------------------------------------------------------
  initPool(options={}) {
    return new Pool({
      create: () => {
        this.debug("connecting to pool");
        return this.connect();
      },
      validate: connection => {
        return this.connected(connection);
      },
      destroy: connection => {
        this.debug("disconnecting from pool");
        return this.disconnect(connection);
      },
      ...poolDefaults,
      ...options
    });
  }

  //-----------------------------------------------------------------------------
  // Pool connections methods - must be implemented by subclasses
  //-----------------------------------------------------------------------------
  async connect()    { notImplemented("connect()")    }
  async connected()  { return true }
  async disconnect() { notImplemented("disconnect()") }

  //-----------------------------------------------------------------------------
  // Methods to acquire and release connections from the pool
  //-----------------------------------------------------------------------------
  async acquire() {
    this.debug("acquire()");
    return this.pool.acquire().promise;
  }

  async release(connection) {
    this.debug("release()");
    await this.pool.release(connection);
  }

  //-----------------------------------------------------------------------------
  // Query execution methods
  //-----------------------------------------------------------------------------
  async clientExecute(client, sql, action) {
    const query = await client.prepare(sql)
    return await action(query);
  }

  async execute(sql, action, options={}) {
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
        this.release(client);
      }
    }
  }

  //-----------------------------------------------------------------------------
  // Generic query methods - most must be defined by subclasses
  //-----------------------------------------------------------------------------
  async run() { notImplemented('run()') }
  async any() { notImplemented('any()') }
  async all() { notImplemented('all()') }

  async one(sql, ...args) {
    const [params, options] = this.queryArgs(args);
    this.debugData("one()", { sql, params, options });
    const rows = await this.all(sql, params, options);
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
  async begin(transact) {
    this.debug('begin()')
    return await this.run(BEGIN, { transact })
  }

  async commit(transact) {
    this.debug('commit()');
    return await this.run(COMMIT, { transact });
  }

  async rollback(transact) {
    this.debug('rollback()');
    return await this.run(ROLLBACK, { transact });
  }

  //-----------------------------------------------------------------------------
  // Query utility methods
  //-----------------------------------------------------------------------------
  parseError(sql, e) {
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

  queryArgs(args) {
    const params = isArray(args[0])
      ? args.shift()
      : [ ];
    const options = args.length
      ? args.shift()
      : { };
    return [params, options];
  }

  prepareValues(values) {
    return values.map(
      // values can be arrays with a comparison, e.g. ['>', 1973], in which case
      // we only want the second element
      value => isArray(value)
        ? value[1]
        : value
    )
  }

  sanitizeResult(result) {
    return result;
  }

  //-----------------------------------------------------------------------------
  // Query formatting
  //-----------------------------------------------------------------------------
  quote(name) {
    if (isObject(name) && name.sql) {
      return name.sql;
    }
    return name
      .split(/\./)
      .map(
        part => part === allColumns
          ? part
          : this.quoteChar + part.replaceAll(this.quoteChar, this.escQuote) + this.quoteChar)
      .join('.');
  }

  quoteTableColumn(table, column) {
    // if the column already has a dot then we quote it as is,
    // otherwise we explicitly add the table name
    return column.match(/\./)
      ? this.quote(column)
      : this.quote(`${table}.${column}`);
  }

  formatPlaceholder() {
    return '?';
  }

  formatColumnPlaceholder(column, n) {
    return `${this.quote(column)}=${this.formatPlaceholder(n)}`;
  }

  formatWherePlaceholder(column, value, n) {
    // value can be an array containing a comparison operator and a value,
    // e.g. ['>' 1973], otherwise we assume it's an equality operator, '='
    const cmp = isArray(value) ? value[0] : equals;
    return `${this.quote(column)} ${cmp} ${this.formatPlaceholder(n)}`;
  }

  formatWhereNull(column) {
    return `${this.quote(column)} is NULL`;
  }

  formatSetPlaceholder(column, n) {
    return `${this.quote(column)} ${equals} ${this.formatPlaceholder(n)}`;
  }

  formatPlaceholders(values, n=1) {
    return values.map(
      () => this.formatPlaceholder(n++)
    ).join(', ');
  }

  formatColumnPlaceholders(columns, n=1, joint=', ') {
    return columns.map(
      column => this.formatColumnPlaceholder(column, n++)
    ).join(joint);
  }

  formatWherePlaceholders(columns, values, n=1, joint=' AND ') {
    let i = 0;
    return columns.map(
      column => this.formatWherePlaceholder(column, values[i++], n++)
    ).join(joint) || whereTrue;
  }

  formatColumns(columns) {
    if (isObject(columns) && columns.sql) {
      return columns.sql;
    }
    return hasValue(columns)
      ? splitList(columns)
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
