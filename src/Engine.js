import Pool from './Pool.js';
import { missing } from './Utils.js';

export class Engine {
  constructor(driver, config={}) {
    this.driver = driver || missing('driver');
    this.pool   = new Pool(driver, config.pool);
  }
  async connect() {
    return this.connection ||= await this.pool.acquire();
  }
  async query(sql) {
    const connection = await this.connect();
    return this.driver.query(connection, sql);
  }
  async destroy() {
    if (this.connection) {
      await this.pool.release(this.connection);
      this.connection = null;
    }
    this.pool.destroy();
  }
}

export const engine = config =>
  new Engine(config)

export default Engine
