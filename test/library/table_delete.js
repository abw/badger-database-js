import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { createUsersTableQuery } from './users_table.js'
import { pass } from './expect.js'

export function runTableDeleteTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test( 'connect',
    () => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required',
            debug: false
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
      await db.run(create);
      pass()
    }
  );

  test( 'insert a row',
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
    }
  )

  test( 'insert another row',
    async () => {
      const users = await db.table('users')
      const result = await users.insert(
        {
          name:  'Brian Badger',
          email: 'brian@badgerpower.com'
        },
        { reload: true }
      )
      expect(result.id).toBe(2)
      expect(result.name).toBe('Brian Badger')
      expect(result.email).toBe('brian@badgerpower.com')
    }
  )

  test( 'insert yet another row',
    async () => {
      const users = await db.table('users')
      const result = await users.insert(
        {
          name:  'Frank Ferret',
          email: 'frank@badgerpower.com'
        },
        { reload: true }
      )
      expect(result.id).toBe(3)
      expect(result.name).toBe('Frank Ferret')
      expect(result.email).toBe('frank@badgerpower.com')
    }
  )

  test( 'fetch all',
    async () => {
      const users = await db.table('users')
      const rows = await users.allRows()
      expect(rows.length).toBe(3)
    }
  )

  test( 'delete first row',
    async () => {
      const users = await db.table('users')
      const result = await users.delete({
        email: 'bobby@badgerpower.com'
      });
      expect(result.changes).toBe(1)
    }
  )

  test( 'fetch two',
    async () => {
      const users = await db.table('users')
      const rows = await users.allRows()
      expect(rows.length).toBe(2)
    }
  )

  test( 'delete second row with comparison',
    async () => {
      const users = await db.table('users');
      const result = await users.delete({
        id: ['>', 2]
      })
      expect(result.changes).toBe(1)
    }
  )

  test( 'fetch one',
    async () => {
      const users = await db.table('users')
      const rows = await users.allRows()
      expect(rows.length).toBe(1)
    }
  )

  test( 'delete all rows',
    async () => {
      const users = await db.table('users')
      const result = await users.delete()
      expect(result.changes).toBe(1)
    }
  )

  test( 'fetch none',
    async () => {
      const users = await db.table('users')
      const rows = await users.allRows()
      expect(rows.length).toBe(0)
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}