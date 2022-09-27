import test from 'ava';
import Postgres from '../../src/Engine/Postgres.js'
import { UnexpectedRowCount } from '../../src/Error.js';

const engine = {
  host:     'localhost',
  database: 'test',
  user:     'test',
  password: 'test',
}

test.serial(
  'no filename error',
  t => {
    const error = t.throws( () => new Postgres() );
    t.is( error.message, 'No "engine" specified' )
  }
)

test.serial(
  'acquire and release',
  async t => {
    const postgres = new Postgres({ engine });
    const conn = await postgres.acquire();
    t.truthy(conn.connection);
    t.is(postgres.pool.numUsed(), 1);
    await postgres.release(conn);
    t.is(postgres.pool.numUsed(), 0);
    await postgres.destroy();
  }
)


test.serial(
  'any',
  async t => {
    const postgres = new Postgres({ engine });
    const result = await postgres.any('SELECT 99 AS number');
    // console.log('any: ', result);
    t.is(result.number, 99);
    await postgres.destroy();
  }
)

test.serial(
  'all',
  async t => {
    const postgres = new Postgres({ engine });
    const result = await postgres.all('SELECT 99 as number');
    // console.log('all: ', result);
    t.is(result[0].number, 99);
    await postgres.destroy();
  }
)

test.serial(
  'drop existing table',
  async t => {
    const postgres = new Postgres({ engine });
    const drop = await postgres.run(
      `DROP TABLE IF EXISTS users`
    )
    t.is( drop.changes, 0 );
    await postgres.destroy();
  }
)

test.serial(
  'create table',
  async t => {
    const postgres = new Postgres({ engine });
    const create = await postgres.run(
      `CREATE TABLE users (
        id SERIAL,
        name TEXT,
        email TEXT
      )`
    )
    t.is( create.changes, 0 );
    await postgres.destroy();
  }
)

test.serial(
  'insert a row',
  async t => {
    const postgres = new Postgres({ engine });
    const insert = await postgres.run(
      'INSERT INTO users (name, email) VALUES ($1, $2)',
      'Bobby Badger', 'bobby@badgerpower.com'
    );
    t.is(insert.changes, 1);
    await postgres.destroy();
  }
)

test.serial(
  'insert another row',
  async t => {
    const postgres = new Postgres({ engine });
    const insert = await postgres.run(
      'INSERT INTO users (name, email) VALUES ($1, $2)',
      'Brian Badger', 'brian@badgerpower.com'
    );
    t.is(insert.changes, 1);
    await postgres.destroy();
  }
)

test.serial(
  'fetch any row',
  async t => {
    const postgres = new Postgres({ engine });
    const bobby = await postgres.any(
      'SELECT * FROM users WHERE email=$1',
      'bobby@badgerpower.com'
    );
    t.is(bobby.name, 'Bobby Badger');
    await postgres.destroy();
  }
)

test.serial(
  'fetch all rows',
  async t => {
    const postgres = new Postgres({ engine });
    const rows = await postgres.all(
      `SELECT id, name, email FROM users`
    );
    t.is( rows[0].name, 'Bobby Badger' );
    t.is( rows[1].name, 'Brian Badger' );
    await postgres.destroy();
  }
)


test.serial(
  'fetch one row',
  async t => {
    const postgres = new Postgres({ engine });
    const row = await postgres.one(
      `SELECT id, name, email FROM users WHERE email=$1`,
      "bobby@badgerpower.com"
    );
    t.is( row.name, 'Bobby Badger' );
    await postgres.destroy();
  }
)

test.serial(
  'fetch one row but none returned',
  async t => {
    const postgres = new Postgres({ engine });
    const error = await t.throwsAsync(
      () => postgres.one(
        `SELECT id, name, email FROM users WHERE email=$1`,
        "bobby@badgerpower.co.uk"
      )
    );
    t.is( error instanceof UnexpectedRowCount, true )
    t.is( error.message, "0 rows were returned when one was expected" )
    await postgres.destroy();
  }
)

test.serial(
  'fetch one row but two returned',
  async t => {
    const postgres = new Postgres({ engine });
    const error = await t.throwsAsync(
      () => postgres.one(
        `SELECT id, name, email FROM users`
      )
    );
    t.is( error instanceof UnexpectedRowCount, true )
    t.is( error.message, "2 rows were returned when one was expected" )
    await postgres.destroy();
  }
)

