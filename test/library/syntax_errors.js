import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { SQLParseError } from '../../src/Utils/Error.js'
import { databaseConfig } from './database.js'
import { createUsersTableQuery } from './users_table.js'
import { pass } from './expect.js'

export function runSyntaxErrorTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test( 'connect',
    () => {
      db = connect({ database });
      pass('connected')
    }
  )

  test( 'create table',
    async () => {
      await db.run('DROP TABLE IF EXISTS users')
      await db.run(create)
      pass()
    }
  )

  test( 'invalid query',
    async () => {
      try {
        await db.run('SELECT x\nFROM "pants"')
      }
      catch(e) {
        expect(e).toBeInstanceOf(SQLParseError)
        expect(e.query).toBe('SELECT x\nFROM "pants"')
      }
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}
