import { Pool as tarnPool } from 'tarn';
import { missing } from './Utils.js';
import { addDebug } from '@abw/badger';
import { extract } from '@abw/badger-utils';

const defaults = {
  min: 2,
  max: 10,
  propagateCreateError: true
}

export class Pool {
  constructor(driver, options={}) {
    this.driver = driver || missing('driver');
    this.config = { ...defaults, ...options }
    const debug = extract(this.config, /^debug/);
    this.pool   = new tarnPool({
      create: () => {
        this.debug("create");
        return this.driver.connect();
      },
      validate: connection => {
        return this.driver.connected(connection);
      },
      destroy: connection => {
        this.debug("destroy");
        return this.driver.disconnect(connection);
      },
      log: (message, logLevel) => console.log(`${logLevel}: ${message}`),
      ...this.config
    });
    addDebug(this, debug.debug, debug.debugPrefix || 'Pool> ', debug.debugColor || 'red');
  }
  async acquire() {
    this.debug("acquire()");
    return this.pool.acquire().promise;
  }
  async release(connection) {
    this.debug("release() ", connection);
    await this.pool.release(connection);
  }
  async destroy() {
    this.debug("destroy() ");
    await this.pool.destroy();
  }
}

export default Pool

