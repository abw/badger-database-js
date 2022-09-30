import test from 'ava';
import { database } from '../../src/Database.js';

export function runTableUpdateTests(engine, create) {
  let db;

  test.serial(
    'database',
    async t => {
      db = await database({
        engine,
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
      const result = await users.insert({
        name:  'Bobby Badger',
        email: 'bobby@badgerpower.com'
      });
      t.is( result.id, 1 );
      t.is( result.changes, 1 );
    }
  )

  test.serial(
    'table update',
    async t => {
      const users = await db.table('users');
      const result = await users.update(
        {
          name:  'Roberto Badger',
        },
        {
          email: 'bobby@badgerpower.com'
        }
      );
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