import test from 'ava';
import Mysql from '../../src/Engine/Mysql.js'
import { engine as engineFactory } from '../../src/Engines.js';
import { UnexpectedRowCount } from '../../src/Utils/Error.js';

const engine = {
  host:     'localhost',
  database: 'test',
  user:     'test',
  password: 'test',
}
const config = {
  driver: 'mysql',
  engine
}

const engineString = `mysql://${engine.user}:${engine.password}@${engine.host}/${engine.database}`;

test.serial(
  'no driver error',
  t => {
    const error = t.throws( () => new Mysql() );
    t.is( error.message, 'No "driver" specified' )
  }
)

test.serial(
  'no engine error',
  t => {
    const error = t.throws( () => new Mysql({ driver: 'mysql' }) );
    t.is( error.message, 'No "engine" specified' )
  }
)

test.serial(
  'acquire and release',
  async t => {
    const mysql = new Mysql(config);
    const conn = await mysql.acquire();
    t.truthy(conn.connection);
    t.is(mysql.pool.numUsed(), 1);
    await mysql.release(conn);
    t.is(mysql.pool.numUsed(), 0);
    await mysql.destroy();
  }
)

test.serial(
  'any',
  async t => {
    const mysql = new Mysql(config);
    const result = await mysql.any('SELECT 99 AS number');
    // console.log('any: ', result);
    t.is(result.number, 99);
    await mysql.destroy();
  }
)

test.serial(
  'all',
  async t => {
    const mysql = new Mysql(config);
    const result = await mysql.all('SELECT 99 as number');
    // console.log('all: ', result);
    t.is(result[0].number, 99);
    await mysql.destroy();
  }
)

test.serial(
  'drop existing table',
  async t => {
    const mysql = new Mysql(config);
    const drop = await mysql.run(
      `DROP TABLE IF EXISTS user`,
      { sanitizeResult: true }
    )
    t.is( drop.changes, 0 );
    await mysql.destroy();
  }
)

test.serial(
  'create table',
  async t => {
    const mysql = new Mysql(config);
    const create = await mysql.run(
      `CREATE TABLE user (
        id SERIAL,
        name TEXT,
        email TEXT
      )`,
      { sanitizeResult: true }
    )
    t.is( create.changes, 0 );
    await mysql.destroy();
  }
)

test.serial(
  'insert a row',
  async t => {
    const mysql = new Mysql(config);
    const insert = await mysql.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      ['Bobby Badger', 'bobby@badgerpower.com'],
      { sanitizeResult: true }
    );
    t.is(insert.changes, 1);
    t.is(insert.id, 1);
    await mysql.destroy();
  }
)

test.serial(
  'insert another row',
  async t => {
    const mysql = new Mysql(config);
    const insert = await mysql.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      ['Brian Badger', 'brian@badgerpower.com'],
      { sanitizeResult: true }
    );
    t.is(insert.id, 2);
    await mysql.destroy();
  }
)

test.serial(
  'fetch any row',
  async t => {
    const mysql = new Mysql(config);
    const bobby = await mysql.any(
      'SELECT * FROM user WHERE email=?',
      ['bobby@badgerpower.com']
    );
    t.is(bobby.name, 'Bobby Badger');
    await mysql.destroy();
  }
)

test.serial(
  'fetch all rows',
  async t => {
    const mysql = new Mysql(config);
    const rows = await mysql.all(
      `SELECT id, name, email FROM user`
    );
    t.is( rows[0].name, 'Bobby Badger' );
    t.is( rows[1].name, 'Brian Badger' );
    await mysql.destroy();
  }
)

test.serial(
  'fetch one row',
  async t => {
    const mysql = new Mysql(config);
    const row   = await mysql.one(
      `SELECT id, name, email FROM user WHERE email=?`,
      ['bobby@badgerpower.com']
    );
    t.is( row.name, 'Bobby Badger' );
    await mysql.destroy();
  }
)

test.serial(
  'fetch one row but none returned',
  async t => {
    const mysql = new Mysql(config);
    const error = await t.throwsAsync(
      () => mysql.one(
        `SELECT id, name, email FROM user WHERE email=?`,
        ['bobby@badgerpower.co.uk']
      )
    );
    t.is( error instanceof UnexpectedRowCount, true )
    t.is( error.message, "0 rows were returned when one was expected" )
    await mysql.destroy();
  }
)

test.serial(
  'fetch one row but two returned',
  async t => {
    const mysql = new Mysql(config);
    const error = await t.throwsAsync(
      () => mysql.one(
        `SELECT id, name, email FROM user`
      )
    );
    t.is( error instanceof UnexpectedRowCount, true )
    t.is( error.message, "2 rows were returned when one was expected" )
    await mysql.destroy();
  }
)

//-----------------------------------------------------------------------------
// engine() function
//-----------------------------------------------------------------------------
test.serial(
  'fetch one row via engine()',
  async t => {
    const mysql = await engineFactory({ engine: { ...engine, driver: 'mysql' } });
    const row   = await mysql.one(
      `SELECT id, name, email FROM user WHERE email=?`,
      ['bobby@badgerpower.com']
    );
    t.is( row.name, 'Bobby Badger' );
    await mysql.destroy();
  }
)

test.serial(
  'fetch one row via engine() with string',
  async t => {
    const mysql = await engineFactory({ engine: engineString });
    const row   = await mysql.one(
      `SELECT id, name, email FROM user WHERE email=?`,
      ['bobby@badgerpower.com']
    );
    t.is( row.name, 'Bobby Badger' );
    await mysql.destroy();
  }
)

//-----------------------------------------------------------------------------
// quote()
//-----------------------------------------------------------------------------
test(
  'quote word',
  async t => {
    const mysql = new Mysql(config);
    t.is( mysql.quote("hello"), "`hello`" )
    await mysql.destroy();
  }
)

test(
  'quote words',
  async t => {
    const mysql = new Mysql(config);
    t.is( mysql.quote("hello.world"), "`hello`.`world`" )
    await mysql.destroy();
  }
)

test(
  'quote words with escapes',
  async t => {
    const mysql = new Mysql(config);
    t.is( mysql.quote("foo`bar"), "`foo\\`bar`" )
    await mysql.destroy();
  }
)

