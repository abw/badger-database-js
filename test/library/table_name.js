import test from 'ava';
import { connect } from '../../src/Database.js';
import { setDebug } from '../../src/index.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery } from './users_table.js';

setDebug({
  // engine: true,
})
export function runTableNameTests(engine) {
  const table    = 'people';
  const database = databaseConfig(engine);
  const create   = createUsersTableQuery(engine, table);
  let db;

  test.serial( 'connect',
    t => {
      db = connect({
        database,
        tables: {
          peeps: {
            table,
            columns: 'id:readonly name:required email:required'
          }
        }
      });
      t.pass();
    }
  )

  test.serial( 'drop table',
    async t => {
      await db.run(
        `DROP TABLE IF EXISTS ${table}`
      )
      t.pass();
    }
  )

  test.serial( 'create table',
    async t => {
      await db.run(create);
      t.pass();
    }
  );

  test.serial( 'insert a row',
    async t => {
      const peeps  = await db.table('peeps');
      const result = await peeps.insert({
        name:  'Bobby Badger',
        email: 'bobby@badgerpower.com'
      });
      t.is( result.id, 1 );
      t.is( result.changes, 1 );
      t.is( result.name, undefined );
      t.is( result.email, undefined );
    }
  )

  test.serial( 'fetch a row',
    async t => {
      const peeps = await db.table('peeps');
      const user  = await peeps.fetchOne({
        email: 'bobby@badgerpower.com'
      });
      t.is( user.id, 1 );
      t.is( user.name, 'Bobby Badger' );
      t.is( user.email, 'bobby@badgerpower.com' );
    }
  )

  test.after( 'disconnect',
    () => db.disconnect()
  )
}