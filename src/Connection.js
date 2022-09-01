import Config from './Config.js'
import Knex from 'knex'

export class Connection {
  constructor(config=Config) {
    this.config = config;
    this.knex   = Knex(config);
  }
  raw() {
    return this.knex.raw(...arguments);
  }
  pool() {
    return this.knex.client.pool;
  }
  acquire() {
    // acquire a connection from the knex client pool in
    // case we need to go direct to the database client
    return this.knex.client.pool.acquire();
  }
  destroy() {
    return this.knex.destroy();
  }
}

export const connection = config =>
  new Connection(config)

export default Connection

