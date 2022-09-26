import test from 'ava';
import Sqlite from '../../src/Engine/Sqlite.js'
import Engines from '../../src/Engines.js'

let sqlite;

test.before(
  'no filename error',
  t => {
    const error = t.throws( () => new Sqlite() );
    t.is( error.message, 'No "filename" specified' )
  }
)

test.before(
  'acquire and release',
  async t => {
    const sqlite = new Sqlite({ filename: ":memory:" });
    const conn = await sqlite.acquire();
    t.is(conn.open, true);
    t.is(sqlite.pool.numUsed(), 1);
    await sqlite.release(conn);
    t.is(sqlite.pool.numUsed(), 0);
    await sqlite.destroy();
  }
)

test.before(
  'connect',
  async t => {
    sqlite = await Engines.sqlite({ filename: ':memory:' });
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
  'fetch one row',
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


