import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { setDebug } from '../../src/Utils/Debug.js'
import { DatabaseInstance } from '@/src/types'

let db: DatabaseInstance

setDebug({ builder: false })

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'create users',
  async () => {
    await db.run(`
      CREATE TABLE users (
        id      INTEGER PRIMARY KEY ASC,
        name    TEXT,
        email   TEXT
      )
    `);
    expect(true).toBeTruthy()
  }
)

test( 'insert a user',
  async () => {
    const result = await db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      ['Bobby Badger', 'bobby@badgerpower.com'],
      { sanitizeResult: true }
    );
    expect(result.changes).toBe(1)
  }
)

test( 'select one',
  async () => {
    const row = await db.build.from('users').select('id name email').one();
    expect(row.id).toBe(1)
    expect(row.name).toBe('Bobby Badger')
    expect(row.email).toBe('bobby@badgerpower.com')
  }
)

test( 'select any',
  async () => {
    const row = await db.build.from('users').select('id name email').any();
    expect(row.id).toBe(1)
    expect(row.name).toBe('Bobby Badger')
    expect(row.email).toBe('bobby@badgerpower.com')
  }
)

test( 'select all',
  async () => {
    const rows = await db.build.from('users').select('id name email').all();
    expect(rows.length).toBe(1)
    expect(rows[0].id).toBe(1)
    expect(rows[0].name).toBe('Bobby Badger')
    expect(rows[0].email).toBe('bobby@badgerpower.com')
  }
)

test( 'add another user',
  async () => {
    const result = await db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      ['Brian Badger', 'brian@badgerpower.com'],
      { sanitizeResult: true }
    );
    expect(result.changes).toBe(1)
  }
)

test( 'select one with value',
  async () => {
    const row = await db.build.from('users').select('id name email').where('email').one(['brian@badgerpower.com']);
    expect(row.id).toBe(2)
    expect(row.name).toBe('Brian Badger')
    expect(row.email).toBe('brian@badgerpower.com')
  }
)

test( 'select one with where value',
  async () => {
    const row = await db.build.from('users').select('id name email').where({ email: 'brian@badgerpower.com' }).one();
    expect(row.id).toBe(2)
    expect(row.name).toBe('Brian Badger')
    expect(row.email).toBe('brian@badgerpower.com')
  }
)

test( 'disconnect',
  () => db.disconnect()
)
