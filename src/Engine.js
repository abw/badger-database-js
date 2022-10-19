import { Pool } from 'tarn';
import { missing, notImplementedInBaseClass, SQLParseError, unexpectedRowCount } from "./Utils/Error.js";
import { format } from './Utils/Format.js';
import { hasValue, isArray, isObject, splitList } from '@abw/badger-utils';
import { addDebugMethod } from './Utils/Debug.js';
import { allColumns, doubleQuote, ORDER_BY, space, whereTrue } from './Constants.js';

const notImplemented = notImplementedInBaseClass('Engine');

const poolDefaults = {
  min: 2,
  max: 10,
  propagateCreateError: true
}

const queries = {
  insert: 'INSERT INTO <table> (<columns>) VALUES (<placeholders>) <returning>',
  update: 'UPDATE <table> SET <set> WHERE <where>',
  delete: 'DELETE FROM <table> WHERE <where>',
  select: 'SELECT <columns> FROM <table> WHERE <where> <order>',
}

export class Engine {
  constructor(config={}) {
    this.engine    = config.engine || missing('engine');
    this.database  = config.database || missing('database');
    this.driver    = this.constructor.driver || missing('driver');
    this.quoteChar = this.constructor.quoteChar || doubleQuote;
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
  async connect() {
    notImplemented("connect()")
  }
  async connected() {
    notImplemented("connected()")
  }
  async disconnect() {
    notImplemented("disconnect()")
  }

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
  async execute(sql, action, options={}) {
    this.debugData("execute()", { sql, options });
    const client = await this.acquire();
    try {
      const query  = await this.prepare(client, sql).catch( e => this.parseError(sql, e) )
      const result = await action(query);
      return options.sanitizeResult
        ? this.sanitizeResult(result, options)
        : result;
    }
    finally {
      this.release(client);
    }
  }
  async prepare(connection, sql) {
    this.debugData("prepare()", { sql });
    return connection.prepare(sql);
  }
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
  optionalParams(params, options) {
    if (isObject(params)) {
      options = params;
      params = [ ];
    }
    return [params, options];
  }
  async run() {
    notImplemented('run()');
  }
  async any() {
    notImplemented('any()');
  }
  async all() {
    notImplemented('all()');
  }
  async one(sql, params, options) {
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
  // Specific queries: insert, update and delete
  //-----------------------------------------------------------------------------
  async insert(table, colnames, values, keys) {
    const columns      = this.formatColumns(colnames);
    const placeholders = this.formatPlaceholders(values);
    const returning    = this.formatReturning(keys);
    const sql          = format(queries.insert, { table, columns, placeholders, returning});
    this.debugData("insert()", { table, colnames, values, keys, sql });
    return this.run(sql, values, { keys, sanitizeResult: true });
  }
  async update(table, datacols, datavals, wherecols, wherevals) {
    const set    = this.formatColumnPlaceholders(datacols);
    const where  = this.formatWherePlaceholders(wherecols, wherevals, datacols.length + 1);
    const values = this.prepareValues(wherevals);
    const sql    = format(queries.update, { table, set, where });
    this.debugData("update()", { table, datacols, datavals, wherecols, wherevals, sql });
    return this.run(sql, [...datavals, ...values], { sanitizeResult: true });
  }
  async delete(table, wherecols, wherevals) {
    const where  = this.formatWherePlaceholders(wherecols, wherevals);
    const values = this.prepareValues(wherevals);
    const sql    = format(queries.delete, { table, where });
    this.debugData("delete()", { table, wherecols, wherevals, sql });
    return this.run(sql, values, { sanitizeResult: true });
  }

  //-----------------------------------------------------------------------------
  // Select queries
  //-----------------------------------------------------------------------------
  selectQuery(table, wherecols, wherevals, options={}) {
    this.debugData("selectQuery()", { table, wherecols, options });
    const columns = this.formatColumns(options.columns);
    const where   = this.formatWherePlaceholders(wherecols, wherevals);
    const order   = this.formatOrderBy(options.orderBy || options.order);
    table = this.quote(table);
    return [
      format(queries.select, { table, columns, where, order }),
      this.prepareValues(wherevals)
    ]
  }
  async selectAll(table, wherecols, wherevals, options={}) {
    const [sql, values] = this.selectQuery(table, wherecols, wherevals, options);
    this.debugData("selectAll()", { table, wherecols, wherevals, options, sql, values });
    return this.all(sql, values);
  }
  async selectAny(table, wherecols, wherevals, options={}) {
    const [sql, values] = this.selectQuery(table, wherecols, wherevals, options);
    this.debugData("selectAny()", { table, wherecols, wherevals, options, sql, values });
    return this.any(sql, values);
  }
  async selectOne(table, wherecols, wherevals, options={}) {
    const [sql, values] = this.selectQuery(table, wherecols, wherevals, options);
    this.debugData("selectOne()", { table, wherecols, wherevals, options, sql, values });
    return this.one(sql, values);
  }
  async select(...args) {
    return this.selectAll(...args);
  }

  //-----------------------------------------------------------------------------
  // Query formatting
  //-----------------------------------------------------------------------------
  sanitizeResult(result) {
    return result;
  }
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
    const cmp = isArray(value) ? value[0] : '=';
    return `${this.quote(column)} ${cmp} ${this.formatPlaceholder(n)}`;
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
  formatReturning() {
    return '';
  }
  formatOrderBy(order) {
    return hasValue(order)
      ? ORDER_BY + space + this.formatColumns(order)
      : '';
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


  //-----------------------------------------------------------------------------
  // Cleanup
  //-----------------------------------------------------------------------------
  async destroy() {
    this.debug("destroy() ");
    await this.pool.destroy();
  }
}

export default Engine
