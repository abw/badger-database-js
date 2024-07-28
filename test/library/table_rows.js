import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { createUsersTableQuery } from './users_table.js'
import { pass } from './expect.js'

export function runTableRowsTests(engine) {
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
      // friends should NOT be returned as it's not listed in table columns
      expect(result.friends).toBe(undefined)
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

  test( 'oneRow()',
    async () => {
      const users = await db.table('users')
      const bobby = await users.oneRow({
        email: 'bobby@badgerpower.com'
      })
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.friends).toBe(undefined)
    }
  )

  test( 'anyRow()',
    async () => {
      const users = await db.table('users')
      const bobby = await users.anyRow({
        email: 'bobby@badgerpower.com'
      })
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.friends).toBe(undefined)
    }
  )

  test( 'allRows()',
    async () => {
      const users = await db.table('users')
      const rows  = await users.allRows({
        email: 'bobby@badgerpower.com'
      })
      expect(rows.length).toBe(1)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[0].email).toBe('bobby@badgerpower.com')
      expect(rows[0].friends).toBe(undefined)
    }
  )

  test( 'allRows() with no spec',
    async () => {
      const users = await db.table('users')
      const rows  = await users.allRows()
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[0].friends).toBe(undefined)
      expect(rows[1].name).toBe('Brian Badger')
      expect(rows[1].friends).toBe(undefined)
    }
  )

  test( 'allRows() with empty spec',
    async () => {
      const users = await db.table('users')
      const rows  = await users.allRows({ })
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[0].friends).toBe(undefined)
      expect(rows[1].name).toBe('Brian Badger')
      expect(rows[1].friends).toBe(undefined)
    }
  )

  test( 'allRows() with order',
    async () => {
      const users = await db.table('users')
      const rows  = await users.allRows({ }, { order: 'name' })
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[1].name).toBe('Brian Badger')
    }
  )

  test( 'allRows() with multiple order columns',
    async () => {
      const users = await db.table('users')
      const rows  = await users.allRows({ }, { order: 'name, id' })
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[1].name).toBe('Brian Badger')
    }
  )

  test( 'allRows() with order DESC',
    async () => {
      const users = await db.table('users')
      const rows  = await users.allRows({ }, { order: { sql: 'name DESC' } })
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe('Brian Badger')
      expect(rows[1].name).toBe('Bobby Badger')
    }
  )

  test( 'allRows() with orderBy',
    async () => {
      const users = await db.table('users')
      const rows  = await users.allRows({ }, { orderBy: { sql: 'name DESC' } })
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe('Brian Badger')
      expect(rows[1].name).toBe('Bobby Badger')
    }
  )

  test( 'allRows() with name comparison',
    async () => {
      const users = await db.table('users')
      const rows  = await users.allRows({
        name: ['!=', 'Bobby Badger']
      })
      expect(rows.length).toBe(1)
      expect(rows[0].name).toBe('Brian Badger')
    }
  )

  test( 'oneRow() with columns',
    async () => {
      const users = await db.table('users')
      const bobby = await users.oneRow(
        {
          email: 'bobby@badgerpower.com'
        },
        {
          columns: 'id name'
        }
      )
      expect(bobby.id).toBe(1)
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe(undefined)
      expect(bobby.friends).toBe(undefined)
    }
  )

  test( 'disconnect()',
    () => db.disconnect()
  )
}