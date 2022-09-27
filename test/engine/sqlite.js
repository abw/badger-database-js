import test from 'ava';
import Sqlite from '../../src/Engine/Sqlite.js'
import Engines from '../../src/Engines.js'
import { UnexpectedRowCount } from '../../src/Error.js';

let sqlite;

test.serial(
  'no engine error',
  t => {
    const error = t.throws( () => new Sqlite() );
    t.is( error.message, 'No "engine" specified' )
  }
)

test.serial(
  'no filename error',
  t => {
    const error = t.throws( () => new Sqlite({ engine: { } }) );
    t.is( error.message, 'No "filename" specified' )
  }
)

test.serial(
  'acquire and release',
  async t => {
    const sqlite = new Sqlite({ engine: { filename: ":memory:" } });
    const conn = await sqlite.acquire();
    t.is(conn.open, true);
    t.is(sqlite.pool.numUsed(), 1);
    await sqlite.release(conn);
    t.is(sqlite.pool.numUsed(), 0);
  }
)

test.serial(
  'connect',
  async t => {
    sqlite = await Engines.sqlite({ engine: { filename: ':memory:' } });
    t.is( sqlite instanceof Sqlite, true )
  }
)

test.serial(
  'any',
  async t => {
    const result = await sqlite.any('SELECT 99 AS number');
    t.is(result.number, 99);
  }
)

test.serial(
  'all',
  async t => {
    const result = await sqlite.all('SELECT 99 as number');
    t.is(result[0].number, 99);
  }
)

test.serial(
  'create table',
  async t => {
    const create = await sqlite.run(
      `CREATE TABLE user (
        id INTEGER PRIMARY KEY ASC,
        name TEXT,
        email TEXT
      )`
    )
    t.is(create.changes, 0);
  }
)

test.serial(
  'insert a row',
  async t => {
    const insert = await sqlite.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      'Bobby Badger', 'bobby@badgerpower.com'
    );
    // console.log('insert: ', insert);
    t.is(insert.changes, 1);
  }
)

test.serial(
  'insert another row',
  async t => {
    const insert = await sqlite.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      'Brian Badger', 'brian@badgerpower.com'
    );
    // console.log('insert: ', insert);
    t.is(insert.changes, 1);
  }
)

test.serial(
  'fetch any row',
  async t => {
    const bobby = await sqlite.any(
      'SELECT * FROM user WHERE email=?',
      'bobby@badgerpower.com'
    );
    t.is(bobby.name, 'Bobby Badger');
  }
)

test.serial(
  'fetch all rows',
  async t => {
    const rows = await sqlite.all(
      `SELECT id, name, email FROM user`
    );
    t.is( rows[0].name, 'Bobby Badger' );
    t.is( rows[1].name, 'Brian Badger' );
  }
)


test.serial(
  'fetch one row',
  async t => {
    const row = await sqlite.one(
      `SELECT id, name, email FROM user WHERE email=?`,
      "bobby@badgerpower.com"
    );
    t.is( row.name, 'Bobby Badger' );
  }
)

test.serial(
  'fetch one row but none returned',
  async t => {
    const error = await t.throwsAsync(
      () => sqlite.one(
        `SELECT id, name, email FROM user WHERE email=?`,
        "bobby@badgerpower.co.uk"
      )
    );
    t.is( error instanceof UnexpectedRowCount, true )
    t.is( error.message, "0 rows were returned when one was expected" )
  }
)

test.serial(
  'fetch one row but two returned',
  async t => {
    const error = await t.throwsAsync(
      () => sqlite.one(
        `SELECT id, name, email FROM user`
      )
    );
    t.is( error instanceof UnexpectedRowCount, true )
    t.is( error.message, "2 rows were returned when one was expected" )
    await sqlite.destroy();
  }
)

test.after(
  'destroy',
  async t => {
    await sqlite.destroy();
    t.pass();
  }
)
