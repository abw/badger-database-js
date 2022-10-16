import test from 'ava';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { createUsersIdTableQuery } from './users_table.js';

export function runTableIdTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersIdTableQuery(engine);
  let db;

  test.serial( 'connect',
    t => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'user_id:readonly:id name:required email:required'
          }
        }
      });
      t.pass();
    }
  )

  test.serial( 'drop table',
    async t => {
      await db.run(
        `DROP TABLE IF EXISTS users`
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

  test.serial( 'table insert',
    async t => {
      const users = await db.table('users');
      const result = await users.insert(
        {
          name:  'Bobby Badger',
          email: 'bobby@badgerpower.com'
        },
        { reload: false }
      );
      t.is( result.id, 1 );
      t.is( result.user_id, 1 );
      t.is( result.changes, 1 );
    }
  )

  test.after( 'disconnect',
    () => db.disconnect()
  )
}