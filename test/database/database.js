import test from 'ava';
import { connect } from '../../src/Database.js'

let db;

test.before( 'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test.serial( 'create',
  async t => {
    const create = await db.run(
      `CREATE TABLE user (
        id INTEGER PRIMARY KEY ASC,
        name TEXT,
        email TEXT
      )`
    );
    t.is(create.changes, 0);
  }
)

test.serial( 'insert a row',
  async t => {
    const insert = await db.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      ['Bobby Badger', 'bobby@badgerpower.com']
    );
    t.is(insert.changes, 1);
  }
)

test.serial( 'fetch any row',
  async t => {
    const bobby = await db.any(
      'SELECT * FROM user WHERE email=?',
      ['bobby@badgerpower.com']
    );
    t.is(bobby.name, 'Bobby Badger');
  }
)

test.after( 'disconnect',
  t => {
    db.disconnect();
    t.pass();
  }
)