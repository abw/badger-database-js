import { expect, test } from 'vitest'
import Mysql from '../../src/Engine/Mysql.js'
import { engine } from '../../src/Engines.js'
import { UnexpectedRowCount } from '../../src/Utils/Error.js'
import { expectToThrowAsyncErrorTypeMessage } from '../library/expect.js'

const database = {
  host:     'localhost',
  database: 'test',
  user:     'test',
  password: 'test',
}
const config = {
  engine: 'mysql',
  database
}

const engineString = `mysql://${database.user}:${database.password}@${database.host}/${database.database}`;

test( 'no engine error',
  () => expect(
    () => new Mysql()
  ).toThrow(
    'No "engine" specified'
  )
)

test( 'no database error',
  () => expect(
    () => new Mysql({ engine: 'mysql' })
  ).toThrow(
    'No "database" specified'
  )
)

test( 'extra options',
  async () => {
    const mysql = await engine({
      engine: 'mysql',
      database: {
        database: 'test',
        dateStrings: true
      }
    })
    expect(mysql.database).toStrictEqual({
      database: 'test',
      dateStrings: true
    })
  }
)

test( 'acquire and release',
  async () => {
    const mysql = new Mysql(config)
    const conn = await mysql.acquire()
    expect(conn.connection).toBeTruthy()
    expect(mysql.pool.numUsed()).toBe(1)
    await mysql.release(conn)
    expect(mysql.pool.numUsed()).toBe(0)
    await mysql.destroy()
  }
)

test( 'any',
  async () => {
    const mysql = new Mysql(config)
    const result = await mysql.any('SELECT 99 AS number')
    expect(result.number).toBe(99)
    await mysql.destroy()
  }
)

test( 'all',
  async () => {
    const mysql = new Mysql(config)
    const result = await mysql.all('SELECT 99 as number')
    expect(result[0].number).toBe(99)
    await mysql.destroy()
  }
)

test( 'drop existing table',
  async () => {
    const mysql = new Mysql(config)
    const drop = await mysql.run(
      `DROP TABLE IF EXISTS user`,
      { sanitizeResult: true }
    )
    expect(drop.changes).toBe(0)
    await mysql.destroy()
  }
)

test( 'create table',
  async () => {
    const mysql = new Mysql(config)
    const create = await mysql.run(
      `CREATE TABLE user (
        id SERIAL,
        name TEXT,
        email TEXT
      )`,
      { sanitizeResult: true }
    )
    expect(create.changes).toBe(0)
    await mysql.destroy()
  }
)

test( 'insert a row',
  async () => {
    const mysql = new Mysql(config)
    const insert = await mysql.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      ['Bobby Badger', 'bobby@badgerpower.com'],
      { sanitizeResult: true }
    )
    expect(insert.changes).toBe(1)
    expect(insert.id).toBe(1)
    await mysql.destroy()
  }
)

test( 'insert another row',
  async () => {
    const mysql = new Mysql(config)
    const insert = await mysql.run(
      'INSERT INTO user (name, email) VALUES (?, ?)',
      ['Brian Badger', 'brian@badgerpower.com'],
      { sanitizeResult: true }
    )
    expect(insert.id).toBe(2)
    await mysql.destroy()
  }
)

test( 'fetch any row',
  async () => {
    const mysql = new Mysql(config)
    const bobby = await mysql.any(
      'SELECT * FROM user WHERE email=?',
      ['bobby@badgerpower.com']
    )
    expect(bobby.name).toBe('Bobby Badger')
    await mysql.destroy()
  }
)

test( 'fetch all rows',
  async () => {
    const mysql = new Mysql(config)
    const rows = await mysql.all(
      `SELECT id, name, email FROM user`
    )
    expect(rows[0].name).toBe('Bobby Badger')
    expect(rows[1].name).toBe('Brian Badger')
    await mysql.destroy()
  }
)

test( 'fetch one row',
  async () => {
    const mysql = new Mysql(config)
    const row   = await mysql.one(
      `SELECT id, name, email FROM user WHERE email=?`,
      ['bobby@badgerpower.com']
    )
    expect(row.name).toBe('Bobby Badger')
    await mysql.destroy()
  }
)

test( 'fetch one row but none returned',
  async () => {
    const mysql = new Mysql(config)
    await expectToThrowAsyncErrorTypeMessage(
      () => mysql.one(
        `SELECT id, name, email FROM user WHERE email=?`,
        ['bobby@badgerpower.co.uk']
      ),
      UnexpectedRowCount,
      "0 rows were returned when one was expected"
    )
    await mysql.destroy()
  }
)
test( 'fetch one row but two returned',
  async () => {
    const mysql = new Mysql(config);
    await expectToThrowAsyncErrorTypeMessage(
      () => mysql.one(
        `SELECT id, name, email FROM user`
      ),
      UnexpectedRowCount,
      '2 rows were returned when one was expected'
    )
    await mysql.destroy()
  }
)

test( 'fetch one row via database()',
  async () => {
    const mysql = await engine({ database: { ...database, engine: 'mysql' } })
    const row   = await mysql.one(
      `SELECT id, name, email FROM user WHERE email=?`,
      ['bobby@badgerpower.com']
    );
    expect(row.name).toBe('Bobby Badger')
    await mysql.destroy()
  }
)

test( 'fetch one row via database() with string',
  async () => {
    const mysql = await engine({ database: engineString })
    const row   = await mysql.one(
      `SELECT id, name, email FROM user WHERE email=?`,
      ['bobby@badgerpower.com']
    )
    expect(row.name).toBe('Bobby Badger')
    await mysql.destroy()
  }
)

test( 'quote word',
  async () => {
    const mysql = new Mysql(config)
    expect(mysql.quote("hello")).toBe("`hello`")
    await mysql.destroy()
  }
)

test( 'quote words',
  async () => {
    const mysql = new Mysql(config)
    expect(mysql.quote("hello.world")).toBe("`hello`.`world`")
    await mysql.destroy()
  }
)

test( 'quote words with escapes',
  async () => {
    const mysql = new Mysql(config)
    expect(mysql.quote("foo`bar")).toBe("`foo\\`bar`")
    await mysql.destroy()
  }
)
