import { expect, test } from 'vitest'
import Sqlite from '../../src/Engine/Sqlite.js'
import Engines, { engine } from '../../src/Engines.js'
import { UnexpectedRowCount } from '../../src/Utils/Error.js'
import { expectToThrowAsyncErrorTypeMessage, pass } from '../library/expect.js';

let sqlite;

const config = {
  engine:   'sqlite',
  filename: ':memory:'
}

test( 'no filename error',
  () => expect(
    () => new Sqlite()
  ).toThrowError(
    'No "filename" specified'
  )
)

test( 'no filename error from empty database',
  () => expect(
    () => new Sqlite({
      engine: 'sqlite',
      database: { }
    })
  ).toThrowError(
    'No "filename" specified'
  )
)

test( 'engine in database',
  async () => {
    const sqlite = await engine({
      database: {
        engine: 'sqlite',
        filename: ':memory:'
      }
    })
    const conn = await sqlite.acquire()
    expect(conn.open).toBe(true)
    await sqlite.release(conn);
    await sqlite.destroy();
  }
)

test( 'no engine error',
  () => expect(
    () => {
      const sqlite = engine({
        database: {
          filename: ':memory:'
        }
      })
    }
  ).toThrowError(
    'No "database.engine" specified'
  )
)

test( 'extra options',
  async () => {
    const sqlite = await engine({
      database: {
        engine: 'sqlite',
        filename: ':memory:',
        options: {
          verbose: 'example'
        }
      }
    })
    expect(sqlite.options).toStrictEqual({ verbose: 'example' })
  }
)

test( 'pool size',
  async () => {
    const sqlite = await engine({ database: config })
    expect(sqlite.pool.min).toBe(1)
    expect(sqlite.pool.max).toBe(1)
    await sqlite.destroy()
  }
)

test( 'acquire and release',
  async () => {
    const sqlite = await engine({ database: config })
    const conn = await sqlite.acquire()
    expect(conn.open).toBe(true)
    expect(sqlite.pool.numUsed()).toBe(1)
    await sqlite.release(conn)
    expect(sqlite.pool.numUsed()).toBe(0)
    await sqlite.destroy()
  }
)

test( 'connect',
  async () => {
    sqlite = await Engines.sqlite(config)
    expect(sqlite).toBeInstanceOf(Sqlite)
  }
)

test( 'any',
  async () => {
    const result = await sqlite.any('SELECT 99 AS number')
    expect(result.number).toBe(99)
  }
)

test( 'all',
  async () => {
    const result = await sqlite.all('SELECT 99 as number')
    expect(result[0].number).toBe(99)
  }
)

test( 'create table',
  async () => {
    const create = await sqlite.run(
      `CREATE TABLE user (
        id INTEGER PRIMARY KEY ASC,
        name TEXT,
        email TEXT
      )`,
      { sanitizeResult: true }
    )
    expect(create.changes).toBe(0)
  }
)

test( 'insert a row',
  async () => {
    const insert = await sqlite.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      ['Bobby Badger', 'bobby@badgerpower.com'],
      { sanitizeResult: true }
    );
    expect(insert.changes).toBe(1)
    expect(insert.id).toBe(1)
    expect(insert.lastInsertRowid).toBe(1)
  }
)

test( 'insert another row',
  async () => {
    const insert = await sqlite.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      ['Brian Badger', 'brian@badgerpower.com'],
      { sanitizeResult: true }
    )
    expect(insert.changes).toBe(1)
    expect(insert.id).toBe(2)
  }
)

test( 'fetch any row',
  async () => {
    const bobby = await sqlite.any(
      'SELECT * FROM user WHERE email=?',
      ['bobby@badgerpower.com']
    )
    expect(bobby.name).toBe('Bobby Badger')
  }
)

test( 'fetch all rows',
  async () => {
    const rows = await sqlite.all(
      `SELECT id, name, email FROM user`
    )
    expect(rows[0].name).toBe('Bobby Badger')
    expect(rows[1].name).toBe('Brian Badger')
  }
)

test( 'fetch one row',
  async () => {
    const row = await sqlite.one(
      `SELECT id, name, email FROM user WHERE email=?`,
      ['bobby@badgerpower.com']
    )
    expect(row.name).toBe('Bobby Badger')
  }
)

test( 'fetch one row but none returned',
  async () => expectToThrowAsyncErrorTypeMessage(
    () => sqlite.one(
      `SELECT id, name, email FROM user WHERE email=?`,
      ['bobby@badgerpower.co.uk']
    ),
    UnexpectedRowCount,
    '0 rows were returned when one was expected'
  )
)

test( 'fetch one row but two returned',
  async () => expectToThrowAsyncErrorTypeMessage(
    () => sqlite.one(
      `SELECT id, name, email FROM user`
    ),
    UnexpectedRowCount,
    '2 rows were returned when one was expected'
  )
)

test( 'destroy',
  async () => {
    await sqlite.destroy()
    pass()
  }
)

test( 'quote word',
  async () => {
    const sqlite = new Sqlite(config)
    expect(sqlite.quote('hello')).toBe('"hello"')
    await sqlite.destroy()
  }
)

test( 'quote words',
  async () => {
    const sqlite = new Sqlite(config)
    expect( sqlite.quote('hello.world')).toBe('"hello"."world"')
    await sqlite.destroy()
  }
)

test( 'quote words with escapes',
  async () => {
    const sqlite = new Sqlite(config)
    expect( sqlite.quote('hello "world"')).toBe('"hello \\"world\\""')
    await sqlite.destroy()
  }
)


