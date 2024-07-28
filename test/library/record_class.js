import { expect, test } from 'vitest'
import Record from '../../src/Record.js'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { createUsersTableQuery } from './users_table.js'
import { pass } from './expect.js'

export class User extends Record {
  hello() {
    return `${this.config.hello || 'Hello'} ${this.row.name}`;
  }
}

export function runRecordClassTests(engine) {
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
            recordClass: User,
          },
          casual_users: {
            table: 'users',
            columns: 'id:readonly name:required email:required',
            recordClass: User,
            recordConfig: {
              hello: 'Hiya'
            }
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
    }
  )

  test( 'hello() method',
    async () => {
      const users = await db.table('users')
      const bobby = await users.oneRecord({
        email: 'bobby@badgerpower.com'
      })
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.row.name).toBe('Bobby Badger')
      expect(bobby.row.email).toBe('bobby@badgerpower.com')
      expect(bobby).toBeInstanceOf(User)
      expect(bobby.hello()).toBe('Hello Bobby Badger')
    }
  )

  test( 'hello() method with record options',
    async () => {
      const users = await db.table('casual_users')
      const bobby = await users.oneRecord({
        email: 'bobby@badgerpower.com'
      })
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.row.name).toBe('Bobby Badger')
      expect(bobby.row.email).toBe('bobby@badgerpower.com')
      expect(bobby).toBeInstanceOf(User)
      expect(bobby.hello()).toBe('Hiya Bobby Badger')
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}