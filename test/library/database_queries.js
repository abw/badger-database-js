import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { createUsersTableQuery } from './users_table.js'
import { pass } from './expect.js';

export function runDatabaseQueryTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test( 'connect',
    () => {
      db = connect({
        database,
      });
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
  )

  test( 'insert a row',
    async () => {
      const result = await db
        .insert('name email')
        .into('users')
        .run(
          [ 'Bobby Badger', 'bobby@badgerpower.com' ],
          { sanitizeResult: true }
        )
      expect(result.changes).toBe(1)
    }
  )

  test( 'insert another row providing values in query',
    async () => {
      const result = await db
        .insert('name email')
        .into('users')
        .values('Brian Badger', 'brian@badgerpower.com')
        .run([], { sanitizeResult: true })
      expect(result.changes).toBe(1)
    }
  )

  test( 'select all rows',
    async () => {
      const badgers = await db
        .select('name')
        .from('users')
        .all()
      expect(badgers.length).toBe(2)
      expect(badgers[0].name).toBe('Bobby Badger')
      expect(badgers[1].name).toBe('Brian Badger')
    }
  )

  test( 'update a row',
    async () => {
      const result = await db
        .update('users')
        .set('name')
        .where('email')
        .run(
          ['Brian the Badger', 'brian@badgerpower.com'],
          { sanitizeResult: true }
        )
      expect(result.changes).toBe(1)
    }
  )

  test( 'update a row with values provided',
    async () => {
      const result = await db
        .update('users')
        .set({ name: 'Bobby the Badger' })
        .where({ email: 'bobby@badgerpower.com' })
        .run([], { sanitizeResult: true })
      expect(result.changes).toBe(1)
    }
  )

  test( 'select Brian the Badger',
    async () => {
      const brian = await db
        .select('name')
        .from('users')
        .where('email')
        .one(['brian@badgerpower.com'])
      expect(brian.name).toBe('Brian the Badger')
    }
  )

  test( 'select Bobby the Badger with values provided',
    async () => {
      const bobby = await db
        .select('name')
        .from('users')
        .where(['email', 'bobby@badgerpower.com'])
        .one()
      expect(bobby.name).toBe('Bobby the Badger')
    }
  )

  test( 'delete Brian the Badger',
    async () => {
      const result = await db
        .delete()
        .from('users')
        .where('email')
        .run(['brian@badgerpower.com'], { sanitizeResult: true })
      expect(result.changes).toBe(1)
    }
  )

  test( 'delete Bobby the Badger with values provided',
    async () => {
      const result = await db
        .delete()
        .from('users')
        .where(['email', 'bobby@badgerpower.com'])
        .run([], { sanitizeResult: true })
      expect(result.changes).toBe(1)
    }
  )

  test( 'fetch none more badgers',
    async () => {
      const badgers = await db
        .select('name')
        .from('users')
        .all()
      expect(badgers.length).toBe(0)
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}