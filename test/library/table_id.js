import test from 'ava';
import { connect } from '../../src/Database.js';

export function runTableIdTests(database, create) {
  let db;

  test.serial(
    'connect',
    async t => {
      db = await connect({
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

  test.serial(
    'drop table',
    async t => {
      await db.run(
        `DROP TABLE IF EXISTS users`
      )
      t.pass();
    }
  )

  test.serial(
    'create table',
    async t => {
      await db.run(create);
      t.pass();
    }
  );

  test.serial(
    'table insert',
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

  test.serial(
    'destroy',
    t => {
      db.destroy();
      t.pass();
    }
  )
}