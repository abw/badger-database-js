import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { pass } from './expect.js'

// NOTE: this only work with Postgres which allows us to
// specify multiple columns in the RETURNING clause.

export function runTableKeysTests(engine) {
  const database = databaseConfig(engine);
  const create = `
    CREATE TABLE users (
    key1 TEXT,
    key2 TEXT,
    name TEXT
  )`
  let db

  test( 'connect',
    () => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'key1:key key2:key name'
          }
        }
      })
      pass()
    }
  )

  test( 'drop table',
    async () => {
      await db.run(
        `DROP TABLE IF EXISTS users`
      )
      pass()
    }
  )

  test( 'create table',
    async () => {
      await db.run(create)
      pass()
    }
  );

  test( 'table insert with reload',
    async () => {
      const users = await db.table('users')
      const result = await users.insert(
        {
          key1: 'a',
          key2: 'b',
          name: 'Bobby Badger'
        },
        { reload: true }
      )
      expect(result.key1).toBe('a')
      expect(result.key2).toBe('b')
      expect(result.name).toBe('Bobby Badger')
    }
  )

  test( 'table insert without reload',
    async () => {
      const users = await db.table('users')
      const result = await users.insert(
        {
          key1: 'a',
          key2: 'b',
          name: 'Brian Badger'
        }
      )
      expect(result.key1).toBe('a')
      expect(result.key2).toBe('b')
      expect(result.changes).toBe(1)
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}