import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'create',
  async () => {
    const create = await db.run(
      `CREATE TABLE user (
        id INTEGER PRIMARY KEY ASC,
        name TEXT,
        email TEXT
      )`
    );
    expect(create.changes).toBe(0)
  }
)

test( 'insert a row',
  async () => {
    const insert = await db.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      ['Bobby Badger', 'bobby@badgerpower.com']
    );
    expect(insert.changes).toBe(1)
  }
)

test( 'fetch any row',
  async () => {
    const bobby = await db.any(
      'SELECT * FROM user WHERE email=?',
      ['bobby@badgerpower.com']
    );
    expect(bobby.name).toBe('Bobby Badger')
  }
)

test( 'disconnect',
  () => db.disconnect()
)