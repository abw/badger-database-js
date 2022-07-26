import test from 'ava';
import Sqlite from '../../src/Engine/Sqlite.js'
import Engines, { engine } from '../../src/Engines.js'
import { UnexpectedRowCount } from '../../src/Utils/Error.js';

let sqlite;

const config = {
  database: {
    engine:   'sqlite',
    filename: ':memory:'
  }
};

test.serial( 'no engine error',
  t => {
    const error = t.throws( () => new Sqlite() );
    t.is( error.message, 'No "engine" specified' )
  }
)

test.serial( 'no database error',
  t => {
    const error = t.throws( () => new Sqlite({ engine: 'sqlite' }) );
    t.is( error.message, 'No "database" specified' )
  }
)

test.serial( 'no filename error',
  t => {
    const error = t.throws( () => new Sqlite({ engine: 'sqlite', database: { } }) );
    t.is( error.message, 'No "filename" specified' )
  }
)

test.serial( 'engine in database',
  async t => {
    const sqlite = await engine({ database: { engine: 'sqlite', filename: ':memory:' }});
    const conn = await sqlite.acquire();
    t.is(conn.open, true);
    await sqlite.release(conn);
    await sqlite.destroy();
  }
)

test.serial( 'engine outside database',
  async t => {
    const sqlite = await engine({ engine: 'sqlite', database: { filename: ':memory:' }});
    const conn = await sqlite.acquire();
    t.is(conn.open, true);
    await sqlite.release(conn);
    await sqlite.destroy();
  }
)

test.serial( 'extra options',
  async t => {
    const sqlite = await engine({ engine: 'sqlite', database: { filename: ':memory:', verbose: 'example' }});
    t.deepEqual( sqlite.options, { verbose: 'example' })
  }
)

test.serial( 'pool size',
  async t => {
    const sqlite = await engine(config);
    t.is(sqlite.pool.min, 1);
    t.is(sqlite.pool.max, 1);
    await sqlite.destroy();
  }
)

test.serial( 'acquire and release',
  async t => {
    const sqlite = await engine(config);
    const conn = await sqlite.acquire();
    t.is(conn.open, true);
    t.is(sqlite.pool.numUsed(), 1);
    await sqlite.release(conn);
    t.is(sqlite.pool.numUsed(), 0);
    await sqlite.destroy();
  }
)

test.serial( 'connect',
  async t => {
    sqlite = await Engines.sqlite(config);
    t.is( sqlite instanceof Sqlite, true )
  }
)

test.serial( 'any',
  async t => {
    const result = await sqlite.any('SELECT 99 AS number');
    t.is(result.number, 99);
  }
)

test.serial( 'all',
  async t => {
    const result = await sqlite.all('SELECT 99 as number');
    t.is(result[0].number, 99);
  }
)

test.serial( 'create table',
  async t => {
    const create = await sqlite.run(
      `CREATE TABLE user (
        id INTEGER PRIMARY KEY ASC,
        name TEXT,
        email TEXT
      )`,
      { sanitizeResult: true }
    )
    t.is(create.changes, 0);
  }
)

test.serial( 'insert a row',
  async t => {
    const insert = await sqlite.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      ['Bobby Badger', 'bobby@badgerpower.com'],
      { sanitizeResult: true }
    );
    t.is(insert.changes, 1);
    t.is(insert.id, 1);
    t.is(insert.lastInsertRowid, 1);
  }
)

test.serial( 'insert another row',
  async t => {
    const insert = await sqlite.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      ['Brian Badger', 'brian@badgerpower.com'],
      { sanitizeResult: true }
    );
    t.is(insert.changes, 1);
    t.is(insert.id, 2);
  }
)

test.serial( 'fetch any row',
  async t => {
    const bobby = await sqlite.any(
      'SELECT * FROM user WHERE email=?',
      ['bobby@badgerpower.com']
    );
    t.is(bobby.name, 'Bobby Badger');
  }
)

test.serial( 'fetch all rows',
  async t => {
    const rows = await sqlite.all(
      `SELECT id, name, email FROM user`
    );
    t.is( rows[0].name, 'Bobby Badger' );
    t.is( rows[1].name, 'Brian Badger' );
  }
)

test.serial( 'fetch one row',
  async t => {
    const row = await sqlite.one(
      `SELECT id, name, email FROM user WHERE email=?`,
      ['bobby@badgerpower.com']
    );
    t.is( row.name, 'Bobby Badger' );
  }
)

test.serial( 'fetch one row but none returned',
  async t => {
    const error = await t.throwsAsync(
      () => sqlite.one(
        `SELECT id, name, email FROM user WHERE email=?`,
        ['bobby@badgerpower.co.uk']
      )
    );
    t.is( error instanceof UnexpectedRowCount, true )
    t.is( error.message, "0 rows were returned when one was expected" )
  }
)

test.serial( 'fetch one row but two returned',
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

test.after( 'destroy',
  async t => {
    await sqlite.destroy();
    t.pass();
  }
)

test( 'quote word',
  async t => {
    const sqlite = new Sqlite(config);
    t.is( sqlite.quote('hello'), '"hello"' )
    await sqlite.destroy();
  }
)

test( 'quote words',
  async t => {
    const sqlite = new Sqlite(config);
    t.is( sqlite.quote('hello.world'), '"hello"."world"' )
    await sqlite.destroy();
  }
)

test( 'quote words with escapes',
  async t => {
    const sqlite = new Sqlite(config);
    t.is( sqlite.quote('hello "world"'), '"hello \\"world\\""' )
    await sqlite.destroy();
  }
)

