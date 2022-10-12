import { connect, Engine, registerEngine } from '../src/index.js'

class BadgerEngine extends Engine {
  configure(config) {
    console.log('got BadgerEngine config:', config);
    return config;
  }
  async connect() {
    return 'BADGER';
  }
  async disconnect() {
    // do nothing
  }
  async run(sql, params=[], options) {
    this.debugData("run()", { sql, params, options });
    return { changes: 0, badgers: 'one' };
  }
  async any(sql, params=[], options) {
    this.debugData("any()", { sql, params, options });
    return { changes: 0, badgers: 'any' };
  }
  async all(sql, params=[], options) {
    this.debugData("all()", { sql, params, options });
    return { changes: 0, badgers: 'all' };
  }
}

registerEngine('badger', BadgerEngine);

async function main() {
  const db = await connect({
    database: 'badger://bobby:s3cr3t@badgerpower.com:999/animals'
  })
  const result = await db.run('BADGER BADGER BADGER');
  console.log('result: ', result);
}

main();