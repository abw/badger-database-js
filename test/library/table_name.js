import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { setDebug } from '../../src/index.js'
import { databaseConfig } from './database.js'
import { createUsersTableQuery } from './users_table.js'
import { pass } from './expect.js'

setDebug({
  // engine: true,
})
export function runTableNameTests(engine) {
  const table    = 'people';
  const database = databaseConfig(engine);
  const create   = createUsersTableQuery(engine, table);
  let db;

  test( 'connect',
    () => {
      db = connect({
        database,
        tables: {
          peeps: {
            table,
            columns: 'id:readonly name:required email:required'
          }
        }
      })
      pass()
    }
  )

  test( 'drop table',
    async () => {
      await db.run(
        `DROP TABLE IF EXISTS ${table}`
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
      const peeps  = await db.table('peeps');
      const result = await peeps.insert({
        name:  'Bobby Badger',
        email: 'bobby@badgerpower.com'
      })
      expect(result.id).toBe(1)
      expect(result.changes).toBe(1)
      expect(result.name).toBe(undefined)
      expect(result.email).toBe(undefined)
    }
  )

  test( 'fetch a row',
    async () => {
      const peeps = await db.table('peeps');
      const user  = await peeps.fetchOne({
        email: 'bobby@badgerpower.com'
      });
      expect(user.id).toBe(1)
      expect(user.name).toBe('Bobby Badger')
      expect(user.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}