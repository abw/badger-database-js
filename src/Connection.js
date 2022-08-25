import Config from './Config.js'
import Knex from 'knex'

export class Connection {
  constructor(config=Config) {
    this.knex = Knex(config);
  }
  hello() {
    return 'Hello World!';
  }
  query() {
    // most queries should be handled by Knex instance
    return this.knex(...arguments);
  }
  raw() {
    return this.knex.raw(...arguments);
  }
  acquire() {
    // acquire a connection from the knex client pool in
    // case we need to go direct to the database client
    return this.knex.client.pool.acquire();
  }
  pool() {
    return this.knex.client.pool;
  }
  destroy() {
    return this.knex.destroy();
  }
}

export const connection = config => new Connection(config)

export default Connection

