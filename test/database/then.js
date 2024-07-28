import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'

test( 'connect',
  () => {
    const db = connect({ database: 'sqlite:memory' });
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'connect and create',
  () => {
    const db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
    db.run(
      `CREATE TABLE users (
        id    INTEGER PRIMARY KEY ASC,
        name  TEXT,
        email TEXT
      )`
    ).then(
      created => expect(created).toBeTruthy()
    )
  }
)

test( 'connect, create and insert',
  () => {
    const db = connect({ database: 'sqlite:memory' })
    expect( db.engine.engine, 'sqlite' );
    db.run(
      `CREATE TABLE users (
        id    INTEGER PRIMARY KEY ASC,
        name  TEXT,
        email TEXT
      )`
    ).then(
      created => expect(created).toBeTruthy()
    ).then(
      () => db.run(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['Bobby Badger', 'bobby@badgerpower.com'],
        { sanitizeResult: true }
      )
    ).then(
      insert => expect(insert.id).toBe(1)
    )
  }
)

test( 'connect, create, insert and select',
  () => {
    const db = connect({ database: 'sqlite:memory' });
    expect( db.engine.engine, 'sqlite' );
    db.run(
      `CREATE TABLE users (
        id    INTEGER PRIMARY KEY ASC,
        name  TEXT,
        email TEXT
      )`
    ).then(
      created => expect(created).toBeTruthy()
    ).then(
      () => db.run(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['Bobby Badger', 'bobby@badgerpower.com'],
        { sanitizeResult: true }
      )
    ).then(
      insert => expect(insert.id).toBe(1)
    ).then(
      () => db.one(
        'SELECT * FROM users WHERE email=?',
        ['bobby@badgerpower.com']
      )
    ).then(
      bobby => {
        expect(bobby.id).toBe(1)
        expect(bobby.name).toBe('Bobby Badger')
      }
    )
  }
)

test( 'connect, create, insert, select and destroy',
  () => {
    const db = connect({ database: 'sqlite:memory' });
    expect( db.engine.engine, 'sqlite' );
    db.run(
      `CREATE TABLE users (
        id    INTEGER PRIMARY KEY ASC,
        name  TEXT,
        email TEXT
      )`
    ).then(
      created => expect(created).toBeTruthy()
    ).then(
      () => db.run(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['Bobby Badger', 'bobby@badgerpower.com'],
        { sanitizeResult: true }
      )
    ).then(
      insert => expect(insert.id).toBe(1)
    ).then(
      () => db.one(
        'SELECT * FROM users WHERE email=?',
        ['bobby@badgerpower.com']
      )
    ).then(
      bobby => {
        expect(bobby.id).toBe(1)
        expect(bobby.name).toBe('Bobby Badger')
      }
    ).then(
      () => db.disconnect()
    )
  }
)
