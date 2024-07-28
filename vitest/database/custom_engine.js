import { expect, test } from 'vitest'
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
  async () => {
    const db = connect({
      database: 'badger://bobby:s3cr3t@badgerpower.com:999/animals'
    })
    const result = await db.run('BADGER BADGER BADGER');
    expect(result.badgers).toBe('one')
  }
)

test( 'mushroom',
  async () => {
    const db = connect({
      database: 'mushroom://bobby:s3cr3t@badgerpower.com:999/animals'
    })
    const result = await db.run('BADGER BADGER BADGER');
    expect(result.badgers).toBe('one')
  }
)

test( 'snake',
  async () => {
    const db = connect({
      database: 'snake://bobby:s3cr3t@badgerpower.com:999/animals'
    })
    const result = await db.run('BADGER BADGER BADGER');
    expect(result.badgers).toBe('one')
  }
)
