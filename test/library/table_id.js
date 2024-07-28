import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { createUsersIdTableQuery } from './users_table.js'
import { pass } from './expect.js'

export function runTableIdTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersIdTableQuery(engine);
  let db;

  test( 'connect',
    () => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'user_id:readonly:id name:required email:required'
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

  test( 'table insert',
    async () => {
      const users = await db.table('users')
      const result = await users.insert(
        {
          name:  'Bobby Badger',
          email: 'bobby@badgerpower.com'
        },
        { reload: false }
      )
      expect(result.id).toBe(1)
      expect(result.user_id).toBe(1)
      expect(result.changes).toBe(1)
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}