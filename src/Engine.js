import { Pool } from 'tarn';
import { missing, notImplementedInBaseClass, SQLParseError, unexpectedRowCount } from "./Utils/Error.js";
import { hasValue, isArray, isObject, splitList } from '@abw/badger-utils';
import { addDebugMethod } from './Utils/Debug.js';
import { allColumns, BEGIN, COMMIT, doubleQuote, ROLLBACK, equals, whereTrue } from './Constants.js';

const notImplemented = notImplementedInBaseClass('Engine');

const poolDefaults = {
  min: 2,
  max: 10,
  propagateCreateError: true
}

export class Engine {
  static beingTrans = BEGIN
  static quoteChar = doubleQuote
  static returning = false

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
  // Generic query methods
  //-----------------------------------------------------------------------------
  async clientExecute(client, sql, action) {
    const query = await client.prepare(sql)
    return await action(query);
  }

  async execute(sql, action, options={}) {
    this.debugData("execute()", { sql, options });
    if (options.transaction) {
      // console.log('ENGINE got a transaction: ', options.transaction.tmpId());
    }
    const client = await this.acquire();
    try {
      const result = await this
        .clientExecute(client, sql, action)
        .catch( e => this.parseError(sql, e) );
      return options.sanitizeResult
        ? this.sanitizeResult(result, options)
        : result;
    }
    finally {
      this.release(client);
    }
  }

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

  async run() { notImplemented('run()') }
  async any() { notImplemented('any()') }
  async all() { notImplemented('all()') }

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
  // Transactions
  //-----------------------------------------------------------------------------
  async transaction(queryable, code) {
    const client = await this.acquire();
    await this.begin(client);
    let handled  = false;
    const commit = async () => {
      handled = true;
      console.log('committing');
      await this.commit(client);
    }
    const rollback = async () => {
      handled = true;
      console.log('rolling back');
      await this.rollback(client);
    }

    try {
      await code(queryable, commit, rollback)
      if (! handled) {
        await commit()
      }
    }
    catch(e) {
      console.log('caught error: ', e);

      if (! handled) {
        await rollback()
      }
      throw(e)
    }
    finally {
      console.log('releasing');

      this.release(client);
    }
  }

  async begin(client) {
    const query = this.constructor.beginTrans;
    console.log('begin()');
    return await client.prepare(query).run();
  }
  async commit(client) {
    return await client.prepare(COMMIT).run();
  }
  async rollback(client) {
    await await client.prepare(ROLLBACK).run();
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
