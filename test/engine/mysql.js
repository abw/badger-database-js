import test from 'ava';
import Mysql from '../../src/Engine/Mysql.js'
import { UnexpectedRowCount } from '../../src/Error.js';

const connection = {
  host:     'localhost',
  database: 'test',
  user:     'test',
  password: 'test',
}

test.serial(
  'no filename error',
  t => {
    const error = t.throws( () => new Mysql() );
    t.is( error.message, 'No "connection" specified' )
  }
)

test.serial(
  'acquire and release',
  async t => {
    const mysql = new Mysql({ connection });
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
    const mysql = new Mysql({ connection });
    const result = await mysql.any('SELECT 99 AS number');
    // console.log('any: ', result);
    t.is(result.number, 99);
    await mysql.destroy();
  }
)

test.serial(
  'all',
  async t => {
    const mysql = new Mysql({ connection });
    const result = await mysql.all('SELECT 99 as number');
    // console.log('all: ', result);
    t.is(result[0].number, 99);
    await mysql.destroy();
  }
)

test.serial(
  'drop existing table',
  async t => {
    const mysql = new Mysql({ connection });
    const drop = await mysql.run(
      `DROP TABLE IF EXISTS user`
    )
    t.is( drop.changes, 0 );
    await mysql.destroy();
  }
)

test.serial(
  'create table',
  async t => {
    const mysql = new Mysql({ connection });
    const create = await mysql.run(
      `CREATE TABLE user (
        id SERIAL,
        name TEXT,
        email TEXT
      )`
    )
    t.is( create.changes, 0 );
    await mysql.destroy();
  }
)

test.serial(
  'insert a row',
  async t => {
    const mysql = new Mysql({ connection });
    const insert = await mysql.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      'Bobby Badger', 'bobby@badgerpower.com'
    );
    t.is(insert.changes, 1);
    await mysql.destroy();
  }
)

test.serial(
  'insert another row',
  async t => {
    const mysql = new Mysql({ connection });
    const insert = await mysql.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      'Brian Badger', 'brian@badgerpower.com'
    );
    t.is(insert.changes, 1);
    await mysql.destroy();
  }
)

test.serial(
  'fetch any row',
  async t => {
    const mysql = new Mysql({ connection });
    const bobby = await mysql.any(
      'SELECT * FROM user WHERE email=?',
      'bobby@badgerpower.com'
    );
    t.is(bobby.name, 'Bobby Badger');
    await mysql.destroy();
  }
)

test.serial(
  'fetch all rows',
  async t => {
    const mysql = new Mysql({ connection });
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
    const mysql = new Mysql({ connection });
    const row   = await mysql.one(
      `SELECT id, name, email FROM user WHERE email=?`,
      "bobby@badgerpower.com"
    );
    t.is( row.name, 'Bobby Badger' );
    await mysql.destroy();
  }
)

test.serial(
  'fetch one row but none returned',
  async t => {
    const mysql = new Mysql({ connection });
    const error = await t.throwsAsync(
      () => mysql.one(
        `SELECT id, name, email FROM user WHERE email=?`,
        "bobby@badgerpower.co.uk"
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
    const mysql = new Mysql({ connection });
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

