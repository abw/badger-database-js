import { expect, test } from 'vitest'
import Postgres from '../../src/Engine/Postgres.js'
import { engine } from '../../src/Engines.js'
import { UnexpectedRowCount } from '../../src/Utils/Error.js'
import { expectToThrowAsyncErrorTypeMessage } from '../library/expect.js'

const database = {
  host:     'localhost',
  database: 'test',
  user:     'test',
  password: 'test',
  engine:   'postgres',
}
const config = {
  database
}

/*
test( 'no engine error',
  () => expect(
    () => new Postgres()
  ).toThrowError(
    'No "engine" specified'
  )
)

test( 'no database error',
  () => expect(
    () => new Postgres({ engine: 'postgres' })
  ).toThrowError(
    'No "database" specified'
  )
)
*/

test( 'extra options',
  async () => {
    const postgres = await engine({
      database: {
        engine: 'postgres',
        database: 'test',
        options: {
          queryTimeout: 3000
        }
      }
    });
    expect(postgres.database).toStrictEqual({ database: 'test', queryTimeout: 3000 })
  }
)

test( 'acquire and release',
  async () => {
    const postgres = new Postgres(database)
    const conn = await postgres.acquire()
    expect(conn.connection).toBeTruthy()
    expect(postgres.pool.numUsed()).toBe(1)
    await postgres.release(conn);
    expect(postgres.pool.numUsed()).toBe(0)
    await postgres.destroy()
  }
)

test( 'any',
  async () => {
    const postgres = new Postgres(database)
    const result = await postgres.any('SELECT 99 AS number')
    expect(result.number).toBe(99)
    await postgres.destroy()
  }
)

test( 'all',
  async () => {
    const postgres = new Postgres(database)
    const result = await postgres.all('SELECT 99 as number')
    expect(result[0].number).toBe(99)
    await postgres.destroy()
  }
)

test( 'drop existing table',
  async () => {
    const postgres = new Postgres(database)
    const drop = await postgres.run(
      `DROP TABLE IF EXISTS users`,
      { sanitizeResult: true }
    )
    expect(drop.changes).toBe(0)
    await postgres.destroy()
  }
)

test( 'create table',
  async () => {
    const postgres = new Postgres(database)
    const create = await postgres.run(
      `CREATE TABLE users (
        id SERIAL,
        name TEXT,
        email TEXT
      )`,
      { sanitizeResult: true }
    )
    expect(create.changes).toBe(0)
    await postgres.destroy()
  }
)

test( 'insert a row',
  async () => {
    const postgres = new Postgres(database)
    const insert = await postgres.run(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
      ['Bobby Badger', 'bobby@badgerpower.com'],
      { sanitizeResult: true }
    )
    expect(insert.changes).toBe(1)
    expect(insert.id).toBe(1)
    await postgres.destroy()
  }
)

test( 'insert another row',
  async () => {
    const postgres = new Postgres(database)
    const insert = await postgres.run(
      'INSERT INTO users (name, email) VALUES ($1, $2)',
      ['Brian Badger', 'brian@badgerpower.com'],
      { sanitizeResult: true }
    )
    expect(insert.changes).toBe(1)
    await postgres.destroy()
  }
)

test( 'fetch any row',
  async () => {
    const postgres = new Postgres(database)
    const bobby = await postgres.any(
      'SELECT * FROM users WHERE email=$1',
      ['bobby@badgerpower.com']
    )
    expect(bobby.name).toBe('Bobby Badger')
    await postgres.destroy()
  }
)

test( 'fetch all rows',
  async () => {
    const postgres = new Postgres(database)
    const rows = await postgres.all(
      `SELECT id, name, email FROM users`
    )
    expect(rows[0].name).toBe('Bobby Badger')
    expect(rows[1].name).toBe('Brian Badger')
    await postgres.destroy()
  }
)

test( 'fetch one row',
  async () => {
    const postgres = new Postgres(database)
    const row = await postgres.one(
      `SELECT id, name, email FROM users WHERE email=$1`,
      ['bobby@badgerpower.com']
    )
    expect(row.name).toBe('Bobby Badger')
    await postgres.destroy()
  }
)

test( 'fetch one row but none returned',
  async () => {
    const postgres = new Postgres(database)
    await expectToThrowAsyncErrorTypeMessage(
      () => postgres.one(
        `SELECT id, name, email FROM users WHERE email=$1`,
        ['bobby@badgerpower.co.uk']
      ),
      UnexpectedRowCount,
      '0 rows were returned when one was expected'
    )
    await postgres.destroy()
  }
)

test( 'fetch one row but two returned',
  async () => {
    const postgres = new Postgres(database);
    await expectToThrowAsyncErrorTypeMessage(
      () => postgres.one(
        `SELECT id, name, email FROM users`
      ),
      UnexpectedRowCount,
      '2 rows were returned when one was expected'
    )
    await postgres.destroy()
  }
)

test( 'quote word',
  async () => {
    const postgres = new Postgres(database)
    expect(postgres.quote('hello')).toBe('"hello"')
    await postgres.destroy()
  }
)

test( 'quote words',
  async () => {
    const postgres = new Postgres(database)
    expect(postgres.quote('hello.world')).toBe('"hello"."world"')
    await postgres.destroy()
  }
)

test( 'quote words with escapes',
  async () => {
    const postgres = new Postgres(database)
    expect(postgres.quote('hello "world"')).toBe('"hello \\"world\\""')
    await postgres.destroy()
  }
)

