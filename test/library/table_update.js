import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { createUsersTableQuery } from './users_table.js'
import { pass } from './expect.js'

export function runTableUpdateTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test( 'connect',
    () => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required friends',
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
      await db.run(create)
      pass()
    }
  );

  test( 'insert a row',
    async () => {
      const users = await db.table('users')
      const result = await users.insert({
        name:   'Bobby Badger',
        email:  'bobby@badgerpower.com',
        friends: 1,
      })
      expect(result.id).toBe(1)
      expect(result.changes).toBe(1)
    }
  )

  test( 'update()',
    async () => {
      const users = await db.table('users')
      const result = await users.update(
        { name:  'Roberto Badger' },
        { email: 'bobby@badgerpower.com' }
      )
      expect(result.changes).toBe(1)
    }
  )

  test( 'updateOne()',
    async () => {
      const users = await db.table('users')
      const result = await users.updateOne(
        { name:  'Roberto Badger' },
        { email: 'bobby@badgerpower.com' }
      )
      expect(result.changes).toBe(1)
    }
  )

  test( 'updateOne(), not found',
    async () => {
      const users = await db.table('users')
      expect(
        () => users.updateOne(
          { name:  'Roberto Badger' },
          { email: 'bobby@badgerpower.co.uk' }
        )
      ).rejects.toThrowError(
        '0 rows were updated when one was expected'
      )
    }
  )

  test( 'updateOne() with reload',
    async () => {
      const users = await db.table('users')
      const result = await users.updateOne(
        { name:  'Robert Badger' },
        { email: 'bobby@badgerpower.com' },
        { reload: true }
      )
      expect(result.changes).toBe(undefined)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Robert Badger')
      expect(result.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'updateOneRow()',
    async () => {
      const users = await db.table('users')
      const result = await users.updateOneRow(
        { name:  'Robby Badger' },
        { email: 'bobby@badgerpower.com' },
      )
      expect(result.changes).toBe(undefined)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Robby Badger')
      expect(result.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'updateRow()',
    async () => {
      const users = await db.table('users')
      const result = await users.updateRow(
        { name:  'Rob Badger' },
        { email: 'bobby@badgerpower.com' },
      )
      expect(result.changes).toBe(undefined)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Rob Badger')
      expect(result.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'updateAny()',
    async () => {
      const users = await db.table('users')
      const result = await users.updateAny(
        { name:  'Roberto Badger' },
        { email: 'bobby@badgerpower.com' }
      )
      expect(result.changes).toBe(1)
    }
  )

  test( 'updateAny() not found',
    async () => {
      const users = await db.table('users')
      const result = await users.updateAny(
        { name:  'Roberto Badger' },
        { email: 'bobby@badgerpower.co.uk' }
      )
      expect(result.changes).toBe(0)
    }
  )

  test( 'updateAny() with reload',
    async () => {
      const users = await db.table('users')
      const result = await users.updateAny(
        { name:  'Robbie Badger' },
        { email: 'bobby@badgerpower.com' },
        { reload: true }
      )
      expect(result.changes).toBe(undefined)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Robbie Badger')
      expect(result.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'updateAnyRow()',
    async () => {
      const users = await db.table('users');
      const result = await users.updateAnyRow(
        { name:  'Bobby Badger' },
        { email: 'bobby@badgerpower.com' },
      );
      expect(result.changes).toBe(undefined)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Bobby Badger')
      expect(result.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'updateAny() with reload on changed item',
    async () => {
      const users = await db.table('users')
      const result = await users.updateAny(
        { email: 'robbie@badgerpower.com', name: 'Robbie Badger' },
        { email: 'bobby@badgerpower.com' },
        { reload: true }
      )
      expect(result.changes).toBe(undefined)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Robbie Badger')
      expect(result.email).toBe('robbie@badgerpower.com')
    }
  )

  test( 'updateAny() with reload on changed item which is 0',
    async () => {
      const users = await db.table('users')
      const result = await users.updateAny(
        { friends: 0 },
        { email: 'robbie@badgerpower.com', friends: 1 },
        { reload: true }
      )
      expect(result.changes).toBe(undefined)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Robbie Badger')
      expect(result.email).toBe('robbie@badgerpower.com')
      expect(result.friends).toBe(0)
    }
  )

  test( 'updateAny() not found with reload',
    async () => {
      const users = await db.table('users')
      const result = await users.updateAny(
        { name:  'Robbie Badger' },
        { email: 'bobby@badgerpower.co.uk' },
        { reload: true }
      )
      expect(result).toBe(undefined)
    }
  )

  test( 'updateAll() not found',
    async () => {
      const users = await db.table('users')
      const result = await users.updateAll(
        { name:  'Robbie Badger' },
        { email: 'bobby@badgerpower.co.uk' },
      )
      expect(result.changes).toBe(0)
    }
  )

  test( 'updateAll() with in not found',
    async () => {
      const users = await db.table('users')
      const result = await users.updateAll(
        { name:  'Robbie Badger' },
        { email: ['in', ['bobby@badgerpower.co.uk', 'nobby@nowhere.com']] },
      )
      expect(result.changes).toBe(0)
    }
  )

  test( 'updateAll() not found with reload error',
    async () => {
      const users = await db.table('users')
      expect(
        () => users.updateAll(
          { name:  'Robbie Badger' },
          { email: 'bobby@badgerpower.co.uk' },
          { reload: true }
        )
      ).rejects.toThrowError(
        'Cannot reload multiple updated rows'
      )
    }
  )

  test( 'insert another row',
    async () => {
      const users = await db.table('users')
      const result = await users.insert({
        name:   'Brian Badger',
        email:  'brian@badgerpower.com',
        friends: 1,
      })
      expect(result.id).toBe(2)
      expect(result.changes).toBe(1)
    }
  )

  test( 'updateAny() with negative email comparison',
    async () => {
      const users = await db.table('users')
      const result = await users.updateAny(
        { email: 'brian-badger@badgerpower.com' },
        { email: ['!=', 'robbie@badgerpower.com'] },
        { reload: true }
      )
      expect(result.changes).toBe(undefined)
      expect(result.id).toBe(2)
      expect(result.name).toBe('Brian Badger')
      expect(result.email).toBe('brian-badger@badgerpower.com')
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}