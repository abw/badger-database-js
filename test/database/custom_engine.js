import test from 'ava';
import { connect, Engine, registerEngine } from '../../src/index.js'

class BadgerEngine extends Engine {
  static protocol = 'badger'
  static alias    = 'mushroom snake'
  static driver   = 'dummy'

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

registerEngine(BadgerEngine);

test( 'badger',
  async t => {
    const db = await connect({
      database: 'badger://bobby:s3cr3t@badgerpower.com:999/animals'
    })
    const result = await db.run('BADGER BADGER BADGER');
    t.is( result.badgers, 'one' );
  }
)

test( 'mushroom',
  async t => {
    const db = await connect({
      database: 'mushroom://bobby:s3cr3t@badgerpower.com:999/animals'
    })
    const result = await db.run('BADGER BADGER BADGER');
    t.is( result.badgers, 'one' );
  }
)

test( 'snake',
  async t => {
    const db = await connect({
      database: 'snake://bobby:s3cr3t@badgerpower.com:999/animals'
    })
    const result = await db.run('BADGER BADGER BADGER');
    t.is( result.badgers, 'one' );
  }
)
