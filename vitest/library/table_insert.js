import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { createUsersTableQuery } from './users_table.js'
import { pass } from './expect.js'

export function runTableInsertTests(engine) {
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
            debug: false,
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
        name:  'Bobby Badger',
        email: 'bobby@badgerpower.com'
      })
      expect(result.id).toBe(1)
      expect(result.changes).toBe(1)
      expect(result.name).toBe(undefined)
      expect(result.email).toBe(undefined)
    }
  )

  test( 'insert another row using insertOne()',
    async () => {
      const users = await db.table('users')
      const result = await users.insertOne(
        {
          name:  'Brian Badger',
          email: 'brian@badgerpower.com'
        },
        {
          reload: true
        }
      )
      expect(result.id).toBe(2)
      expect(result.name).toBe('Brian Badger')
      expect(result.email).toBe('brian@badgerpower.com')
    }
  )

  test( 'allRows()',
    async () => {
      // make sure we can fetch two rows
      const users = await db.table('users')
      const badgers = await users.allRows()    // why not all?
      expect(badgers.length).toBe(2)
      expect(badgers[0].name).toBe('Bobby Badger')
      expect(badgers[1].name).toBe('Brian Badger')
    }
  )

  test( 'insert multiple rows',
    async () => {
      const users = await db.table('users')
      const result = await users.insert([
        {
          name:  'Roger Rabbit',
          email: 'roger@badgerpower.com'
        },
        {
          name:  'Willy Weasel',
          email: 'willy@badgerpower.com'
        },
      ])
      expect(result.length).toBe(2)
      expect(result[0].id).toBe(3)
      expect(result[0].name).toBe(undefined)
      expect(result[1].id).toBe(4)
      expect(result[1].name).toBe(undefined)
    }
  )

  test( 'insert multiple rows with reload',
    async () => {
      const users = await db.table('users')
      const result = await users.insert(
        [
          {
            name:  'Franky Ferret',
            email: 'franky@badgerpower.com'
          },
          {
            name:  'Simon Stoat',
            email: 'simon@badgerpower.com'
          },
        ],
        { reload: true }
      )
      expect(result.length).toBe(2)
      expect(result[0].id).toBe(5)
      expect(result[0].name).toBe('Franky Ferret')
      expect(result[0].email).toBe('franky@badgerpower.com')
      expect(result[1].id).toBe(6)
      expect(result[1].name).toBe('Simon Stoat')
      expect(result[1].email).toBe('simon@badgerpower.com')
    }
  )

  test( 'insert multiple rows using insertAll()',
    async () => {
      const users = await db.table('users')
      const result = await users.insertAll([
        {
          name:  'Edward Elephant',
          email: 'edward@badgerpower.com'
        },
        {
          name:  'Alan Aaardvark',
          email: 'alan@badgerpower.com'
        },
      ])
      expect(result.length).toBe(2)
      expect(result[0].id).toBe(7)
      expect(result[0].name).toBe(undefined)
      expect(result[1].id).toBe(8)
      expect(result[1].name).toBe(undefined)
    }
  )

  test( 'insert multiple rows using insertAll() with reload',
    async () => {
      const users = await db.table('users')
      const result = await users.insertAll(
        [
          {
            name:  'Hector Horse',
            email: 'hector@badgerpower.com'
          },
          {
            name:  'Ian Iguana',
            email: 'ian@badgerpower.com'
          },
        ],
        { reload: true }
      )
      expect(result.length).toBe(2)
      expect(result[0].id).toBe(9)
      expect(result[0].name).toBe('Hector Horse')
      expect(result[1].id).toBe(10)
      expect(result[1].name).toBe('Ian Iguana')
    }
  )

  test( 'insertRows()',
    async () => {
      const users = await db.table('users')
      const rows = await users.insertRows(
        [
          {
            name:  'Julie Jackdaw',
            email: 'julie@badgerpower.com'
          },
          {
            name:  'Kevin Kangaroo',
            email: 'kevin@badgerpower.com'
          },
        ]
      )
      expect(rows.length).toBe(2)
      expect(rows[0].id).toBe(11)
      expect(rows[0].name).toBe('Julie Jackdaw')
      expect(rows[0].email).toBe('julie@badgerpower.com')
      expect(rows[1].id).toBe(12)
      expect(rows[1].name).toBe('Kevin Kangaroo')
      expect(rows[1].email).toBe('kevin@badgerpower.com')
    }
  )

  test( 'insertAllRows()',
    async () => {
      const users = await db.table('users')
      const rows = await users.insertAllRows(
        [
          {
            name:  'Lionel Llama',
            email: 'lionel@badgerpower.com'
          },
          {
            name:  'Mavis Mouse',
            email: 'mavis@badgerpower.com'
          },
        ]
      )
      expect(rows.length).toBe(2)
      expect(rows[0].id).toBe(13)
      expect(rows[0].name).toBe('Lionel Llama')
      expect(rows[0].email).toBe('lionel@badgerpower.com')
      expect(rows[1].id).toBe(14)
      expect(rows[1].name).toBe('Mavis Mouse')
      expect(rows[1].email).toBe('mavis@badgerpower.com')
    }
  )

  test( 'insertRow()',
    async () => {
      const users = await db.table('users')
      const row   = await users.insertRow({
        name:  'Nick Narwhal',
        email: 'nick@badgerpower.com'
      })
      expect(row.id).toBe(15)
      expect(row.name).toBe('Nick Narwhal')
      expect(row.email).toBe('nick@badgerpower.com')
    }
  )

  test( 'insertOneRow()',
    async () => {
      const users = await db.table('users')
      const row   = await users.insertOneRow({
        name:  'Oliver Okapi',
        email: 'oliver@badgerpower.com'
      })
      expect(row.id).toBe(16)
      expect(row.name).toBe('Oliver Okapi')
      expect(row.email).toBe('oliver@badgerpower.com')
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}