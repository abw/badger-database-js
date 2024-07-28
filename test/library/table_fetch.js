import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { createUsersTableQuery } from './users_table.js'
import { pass } from './expect.js'

export function runTableFetchTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test( 'connect',
    () => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required animal',
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

  test( 'insert rows',
    async () => {
      const users = await db.table('users')
      const result = await users.insert([
        {
          name:   'Frank Ferret',
          email:  'frank@badgerpower.com',
          animal: 'Ferret',
        },
        {
          name:   'Bobby Badger',
          email:  'bobby@badgerpower.com',
          animal: 'Badger',
        },
        {
          name:   'Brian Badger',
          email:  'brian@badgerpower.com',
          animal: 'Badger',
        },
      ])
      expect(result.length).toBe(3)
    }
  )

  test( 'fetch() returning many',
    async () => {
      const users = await db.table('users');
      const rows  = await users.fetch({
        animal: 'Badger'
      })
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[1].name).toBe('Brian Badger')
    }
  )

  test( 'fetchOne()',
    async () => {
      const users = await db.table('users');
      const bobby = await users.fetchOne({
        email: 'bobby@badgerpower.com'
      })
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.friends).toBe(undefined)
    }
  )

  test( 'fetchAny()',
    async () => {
      const users = await db.table('users');
      const bobby = await users.fetchAny({
        email: 'bobby@badgerpower.com'
      })
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.friends).toBe(undefined)
    }
  )

  test( 'fetchAll() returning one',
    async () => {
      const users = await db.table('users');
      const rows  = await users.fetchAll({
        email: 'bobby@badgerpower.com'
      })
      expect(rows.length).toBe(1)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[0].email).toBe('bobby@badgerpower.com')
      expect(rows[0].friends).toBe(undefined)
    }
  )

  test( 'fetchAll() returning many',
    async () => {
      const users = await db.table('users')
      const rows  = await users.fetchAll({
        animal: 'Badger'
      })
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[1].name).toBe('Brian Badger')
    }
  )

  test( 'fetchAll() many in',
    async () => {
      const users = await db.table('users')
      const rows  = await users.fetchAll({
        name: ['in', ['Bobby Badger', 'Brian Badger']]
      })
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[1].name).toBe('Brian Badger')
    }
  )

  test( 'fetchAll() with no spec',
    async () => {
      const users = await db.table('users')
      const rows  = await users.fetchAll()
      expect(rows.length).toBe(3)
      expect(rows[0].name).toBe('Frank Ferret')
      expect(rows[1].name).toBe('Bobby Badger')
      expect(rows[2].name).toBe('Brian Badger')
    }
  )

  test( 'fetchAll() with empty spec',
    async () => {
      const users = await db.table('users')
      const rows  = await users.fetchAll({ })
      expect(rows.length).toBe(3)
      expect(rows[0].name).toBe('Frank Ferret')
      expect(rows[1].name).toBe('Bobby Badger')
      expect(rows[2].name).toBe('Brian Badger')
    }
  )

  test( 'fetchAll() with order',
    async () => {
      const users = await db.table('users')
      const rows  = await users.fetchAll({ }, { order: 'name' })
      expect(rows.length).toBe(3)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[1].name).toBe('Brian Badger')
      expect(rows[2].name).toBe('Frank Ferret')
    }
  )

  test( 'fetchAll() with multiple order columns',
    async () => {
      const users = await db.table('users')
      const rows  = await users.fetchAll({ }, { order: 'animal, name' })
      expect(rows.length).toBe(3)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[1].name).toBe('Brian Badger')
      expect(rows[2].name).toBe('Frank Ferret')
    }
  )

  test( 'fetchAll() with order DESC',
    async () => {
      const users = await db.table('users')
      const rows  = await users.fetchAll({ }, { order: { sql: 'name DESC' } })
      expect(rows.length).toBe(3)
      expect(rows[0].name).toBe('Frank Ferret')
      expect(rows[1].name).toBe('Brian Badger')
      expect(rows[2].name).toBe('Bobby Badger')
    }
  )

  test( 'fetchAll() with orderBy',
    async () => {
      const users = await db.table('users')
      const rows  = await users.fetchAll({ }, { orderBy: { sql: 'name DESC' } })
      expect(rows.length).toBe(3)
      expect(rows[0].name).toBe('Frank Ferret')
      expect(rows[1].name).toBe('Brian Badger')
      expect(rows[2].name).toBe('Bobby Badger')
    }
  )

  test( 'fetchAll() with name comparison',
    async () => {
      const users = await db.table('users')
      const rows  = await users.fetchAll({
        name: ['!=', 'Bobby Badger']
      })
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe('Frank Ferret')
      expect(rows[1].name).toBe('Brian Badger')
    }
  )

  test( 'fetchAll() with name comparison and order',
    async () => {
      const users = await db.table('users')
      const rows  = await users.fetchAll(
        { name: ['!=', 'Bobby Badger'] },
        { order: 'name' }
      )
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe('Brian Badger')
      expect(rows[1].name).toBe('Frank Ferret')
    }
  )

  test( 'fetchOne() with columns',
    async () => {
      const users = await db.table('users')
      const bobby = await users.fetchOne(
        {
          email: 'bobby@badgerpower.com'
        },
        {
          columns: 'id name'
        }
      )
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe(undefined)
      expect(bobby.friends).toBe(undefined)
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}