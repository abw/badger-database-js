import test from 'ava';
import { connect } from '../../src/Database.js';

test(
  'connect',
  t => {
    const db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' )
  }
)

test(
  'connect and create',
  t => {
    const db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
    db.run(
      `CREATE TABLE users (
        id    INTEGER PRIMARY KEY ASC,
        name  TEXT,
        email TEXT
      )`
    ).then(
      created => t.is( created.changes, 1 )
    )
  }
)

test(
  'connect, create and insert',
  t => {
    const db = connect({ database: 'sqlite:memory' })
    t.is( db.engine.engine, 'sqlite' );
    db.run(
      `CREATE TABLE users (
        id    INTEGER PRIMARY KEY ASC,
        name  TEXT,
        email TEXT
      )`
    ).then(
      created => t.is( created.changes, 1 )
    ).then(
      () => db.run(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['Bobby Badger', 'bobby@badgerpower.com']
      )
    ).then(
      insert => t.is(insert.id, 1)
    )
  }
)

test(
  'connect, create, insert and select',
  t => {
    const db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
    db.run(
      `CREATE TABLE users (
        id    INTEGER PRIMARY KEY ASC,
        name  TEXT,
        email TEXT
      )`
    ).then(
      created => t.is( created.changes, 1 )
    ).then(
      () => db.run(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['Bobby Badger', 'bobby@badgerpower.com']
      )
    ).then(
      insert => t.is(insert.id, 1)
    ).then(
      () => db.one(
        'SELECT * FROM users WHERE email=?',
        ['bobby@badgerpower.com']
      )
    ).then(
      bobby => {
        t.is(bobby.id, 1);
        t.is(bobby.name, 'Bobby Badger');
      }
    )
  }
)

test(
  'connect, create, insert, select and destroy',
  t => {
    const db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
    db.run(
      `CREATE TABLE users (
        id    INTEGER PRIMARY KEY ASC,
        name  TEXT,
        email TEXT
      )`
    ).then(
      created => t.is( created.changes, 1 )
    ).then(
      () => db.run(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['Bobby Badger', 'bobby@badgerpower.com']
      )
    ).then(
      insert => t.is(insert.id, 1)
    ).then(
      () => db.one(
        'SELECT * FROM users WHERE email=?',
        ['bobby@badgerpower.com']
      )
    ).then(
      bobby => {
        t.is(bobby.id, 1);
        t.is(bobby.name, 'Bobby Badger');
      }
    ).then(
      () => db.disconnect()
    )
  }
)
