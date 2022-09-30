import { Pool } from 'tarn';
import { missing, notImplementedInBaseClass, unexpectedRowCount } from "./Utils/Error.js";
import { format } from './Utils/Format.js';
import { splitList } from '@abw/badger-utils';
import { addDebugMethod } from './Utils/Debug.js';

const notImplemented = notImplementedInBaseClass('Engine');

const poolDefaults = {
  min: 2,
  max: 10,
  propagateCreateError: true
}

const quoteChars = {
  mysql:   '`',
  default: '"',
};

const queries = {
  insert: 'INSERT INTO <table> (<columns>) VALUES (<placeholders>) <returning>',
  update: 'UPDATE <table> SET <set> WHERE <where>',
  delete: 'DELETE FROM <table> WHERE <where>',
  select: 'SELECT <columns> FROM <table> WHERE <where>',
}

export class Engine {
  constructor(config={}) {
    this.driver    = config.driver || missing('driver');
    this.engine    = config.engine || missing('engine');
    this.config    = this.configure(config);
    this.pool      = this.initPool(config.pool);
    this.quoteChar = quoteChars[this.driver||'default'] || quoteChars.default;
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
        this.debug("create");
        return this.connect();
      },
      validate: connection => {
        return this.connected(connection);
      },
      destroy: connection => {
        this.debug("destroy");
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
    this.debug("release() ", connection);
    await this.pool.release(connection);
  }

  //-----------------------------------------------------------------------------
  // Generic query methods
  //-----------------------------------------------------------------------------
  async execute(sql, action, options={}) {
    this.debug("execute() ", sql);
    const connection = await this.acquire();
    const query      = await this.prepare(connection, sql);
    const result     = await action(query);
    this.release(connection);
    return options
      ? this.sanitizeResult(result, options)
      : result;
  }
  async prepare(connection, sql) {
    this.debug("prepare() ", sql);
    return connection.prepare(sql);
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
    const rows = await this.all(sql, params, options);
    if (rows.length === 1) {
      return rows[0];
    }
    else {
      unexpectedRowCount(rows.length);
    }
  }
  //-----------------------------------------------------------------------------
  // Specific queries
  //-----------------------------------------------------------------------------
  async insert(table, colnames, values, keys) {
    const columns      = this.formatColumns(colnames);
    const placeholders = this.formatPlaceholders(values);
    const returning    = this.formatReturning(keys);
    const sql          = format(queries.insert, { table, columns, placeholders, returning});
    this.debug('insert: ', sql);
    return this.run(sql, values, { keys, insert: true });
  }
  async update(table, datacols, datavals, wherecols, wherevals) {
    const set   = this.formatColumnPlaceholders(datacols);
    const where = this.formatColumnPlaceholders(wherecols, ' AND ', datacols.length + 1);
    const sql   = format(queries.update, { table, set, where });
    this.debug('update: ', sql);
    return this.run(sql, [...datavals, ...wherevals]);
  }
  async delete(table, wherecols, wherevals) {
    const where = this.formatColumnPlaceholders(wherecols, ' AND ');
    const sql   = format(queries.delete, { table, where });
    this.debug('delete: ', sql);
    return this.run(sql, wherevals);
  }
  async select(table, wherecols, wherevals, options={}) {
    const columns = options.columns
      ? this.formatColumns(options.columns)
      : '*';
    const where = this.formatColumnPlaceholders(wherecols, ' AND ');
    const sql   = format(queries.select, { table, columns, where });
    this.debug('select: ', sql);
    return this.all(sql, wherevals);
  }

  //-----------------------------------------------------------------------------
  // Query formatting
  //-----------------------------------------------------------------------------
  sanitizeResult(result) {
    return result;
  }
  quote(name) {
    return name
      .split(/\./)
      .map(
        part => this.quoteChar + part.replaceAll(this.quoteChar, this.escQuote) + this.quoteChar)
      .join('.');
  }
  quoteTableColumn(table, column) {
    // if the column already has a dot then we quote it as is,
    // otherwise we explicitly add the table name
    return column.match(/\./)
      ? this.quote(column)
      : this.quote(`${table}.${column}`);
  }
  formatPlaceholders(values) {
    return values.map(
      () => '?'
    ).join(', ');
  }
  formatColumnPlaceholder(column) {
    return `${this.quote(column)}=?`;
  }
  formatColumnPlaceholders(columns, joint=', ') {
    return columns.map(
      column => this.formatColumnPlaceholder(column)
    ).join(joint);
  }
  formatColumns(columns) {
    return splitList(columns).map(
      column => this.quote(column)
    ).join(', ');
  }
  formatReturning() {
    return '';
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
