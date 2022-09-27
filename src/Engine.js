import { Pool } from 'tarn';
import { addDebug } from '@abw/badger';
import { notImplementedInBaseClass } from "./Utils.js";
import { unexpectedRowCount } from './Error.js';

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

export class Engine {
  constructor(config={}) {
    this.config = this.configure(config);
    addDebug(
      this,
      config.debug,
      config.debugPrefix || debugDefaults.prefix,
      config.debugColor  || debugDefaults.color
    );
    this.pool = this.initPool(config.pool);
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
  // Query methods
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

  //-----------------------------------------------------------------------------
  // Cleanup
  //-----------------------------------------------------------------------------
  async destroy() {
    this.debug("destroy() ");
    await this.pool.destroy();
  }
}

export default Engine
