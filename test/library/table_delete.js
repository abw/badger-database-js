import test from 'ava';
import { connect } from '../../src/Database.js';

export function runTableDeleteTests(database, create) {
  let db;

  test.serial(
    'database',
    async t => {
      db = await connect({
        database,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required'
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
        { reload: true }
      );
      t.is( result.id, 1 );
      t.is( result.name, 'Bobby Badger' );
      t.is( result.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial(
    'fetch all',
    async t => {
      const users = await db.table('users');
      const rows = await users.allRows();
      t.is( rows.length, 1 );
    }
  )

  test.serial(
    'table delete',
    async t => {
      const users = await db.table('users');
      const result = await users.delete({
        email: 'bobby@badgerpower.com'
      });
      t.is( result.changes, 1 );
    }
  )

  test.serial(
    'fetch none',
    async t => {
      const users = await db.table('users');
      const rows = await users.allRows();
      t.is( rows.length, 0 );
    }
  )

  test.after(
    'destroy',
    t => {
      db.destroy();
      t.pass();
    }
  )
}