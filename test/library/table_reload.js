import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { createUsersTableQuery } from './users_table.js'
import { pass } from './expect.js'

export function runTableReloadTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test( 'connect',
    () => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required'
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
          name:  'Bobby Badger',
          email: 'bobby@badgerpower.com'
        },
        { reload: true }
      )
      expect(result.id).toBe(1)
      expect(result.name).toBe('Bobby Badger')
      expect(result.email).toBe('bobby@badgerpower.com')
      expect(result.changes).toBe(undefined)
    }
  )

  test( 'table insert without reload',
    async () => {
      const users = await db.table('users')
      const result = await users.insert(
        {
          name:  'Brian Badger',
          email: 'brian@badgerpower.com'
        },
        { reload: false }
      )
      expect(result.id).toBe(2)
      expect(result.changes).toBe(1)
      expect(result.name).toBe(undefined)
      expect(result.email).toBe(undefined)
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}