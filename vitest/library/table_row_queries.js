import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { createUsersTableQuery, dropUsersTableQuery } from './users_table.js'
import { pass } from './expect.js'

export function runTableRowQueries(engine) {
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
            queries: {
              all:     t => t.select(),
              byName:  t => t.select().where('name'),
              byEmail: t => t.select().where('email')
            }
          },
        }
      })
      pass()
    }
  )

  test( 'drop table',
    async () => {
      await db.run(dropUsersTableQuery)
      pass()
    }
  )

  test( 'create table',
    async () => {
      await db.run(create)
      pass()
    }
  );

  test( 'insert rows',
    async () => {
      const users = await db.table('users');
      const result = await users.insert([
        {
          name:  'Bobby Badger',
          email: 'bobby@badgerpower.com'
        },
        {
          name:  'Brian Badger',
          email: 'brian@badgerpower.com'
        },
      ]);
      expect(result.length).toBe(2)
    }
  )

  test( 'one()',
    async () => {
      const users = await db.table('users')
      const bobby = await users.one('byEmail', ['bobby@badgerpower.com'])
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'any()',
    async () => {
      const users = await db.table('users')
      const bobby = await users.any('byEmail', ['bobby@badgerpower.com'])
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'all()',
    async () => {
      const users = await db.table('users')
      const rows  = await users.all(users.select())
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe( 'Bobby Badger')
      expect(rows[0].email).toBe('bobby@badgerpower.com')
      expect(rows[1].name).toBe( 'Brian Badger')
      expect(rows[1].email).toBe('brian@badgerpower.com')
    }
  )

  test( 'oneRow() with data',
    async () => {
      const users = await db.table('users')
      const bobby = await users.oneRow({ email: 'bobby@badgerpower.com' })
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'oneRow() with query',
    async () => {
      const users = await db.table('users')
      const bobby = await users.oneRow('byEmail', ['bobby@badgerpower.com'])
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'anyRow() with data',
    async () => {
      const users = await db.table('users')
      const bobby = await users.anyRow({ email: 'bobby@badgerpower.com' })
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'anyRow() with query',
    async () => {
      const users = await db.table('users')
      const bobby = await users.anyRow('byEmail', ['bobby@badgerpower.com'])
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'allRows() with data',
    async () => {
      const users = await db.table('users')
      const rows  = await users.allRows()
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[0].email).toBe('bobby@badgerpower.com')
      expect(rows[1].name).toBe('Brian Badger')
      expect(rows[1].email).toBe('brian@badgerpower.com')
    }
  )

  test( 'allRows() with query',
    async () => {
      const users = await db.table('users')
      const rows = await users.allRows('all')
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[0].email).toBe('bobby@badgerpower.com')
      expect(rows[1].name).toBe('Brian Badger')
      expect(rows[1].email).toBe('brian@badgerpower.com')
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}