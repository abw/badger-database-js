import { Pool } from 'tarn';
import { addDebug } from '@abw/badger';
import { missing, notImplementedInBaseClass, unexpectedRowCount } from "./Utils/Error.js";
import { format } from './Utils/Format.js';

const notImplemented = notImplementedInBaseClass('Engine');

const poolDefaults = {
  min: 2,
  max: 10,
  propagateCreateError: true
}

const debugDefaults = {
  prefix: 'Engine> ',
  color:  'red',
}

const quoteChars = {
  mysql:   '`',
  default: '"',
};

const queries = {
  insert: 'INSERT INTO <table> (<columns>) VALUES (<placeholders>) <returning>'
}

export class Engine {
  constructor(config={}) {
    this.driver    = config.driver || missing('driver');
    this.engine    = config.engine || missing('engine');
    this.config    = this.configure(config);
    this.pool      = this.initPool(config.pool);
    this.quoteChar = quoteChars[this.driver||'default'] || quoteChars.default;
    this.escQuote  = `\\${this.quoteChar}`;
    addDebug(
      this,
      config.debug,
      config.debugPrefix || debugDefaults.prefix,
      config.debugColor  || debugDefaults.color
    );
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
  async execute(sql, action) {
    this.debug("execute() ", sql);
    const connection = await this.acquire();
    const query      = await this.prepare(connection, sql);
    const result     = await action(query);
    this.release(connection);
    return this.sanitizeResult(result);
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
  async one(sql, ...params) {
    const rows = await this.all(sql, ...params);
    if (rows.length === 1) {
      return rows[0];
    }
    else {
      unexpectedRowCount(rows.length);
    }
  }
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
  formatColumns(columns) {
    return columns.join(', ');
  }
  formatPlaceholders(values) {
    return values.map(() => '?').join(', ');
  }
  formatReturning() {
    return '';
  }

  //-----------------------------------------------------------------------------
  // Specific queries
  //-----------------------------------------------------------------------------
  async insert(table, colnames, values, keys) {
    const columns      = this.formatColumns(colnames);
    const placeholders = this.formatPlaceholders(values);
    const returning    = this.formatReturning(keys);
    const sql          = format(queries.insert, { table, columns, placeholders, returning});
    return this.run(sql, ...values);
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
