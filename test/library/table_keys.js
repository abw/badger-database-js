import test from 'ava';
import { database } from '../../src/Database.js';

// NOTE: this only work with Postgres which allows us to
// specify multiple columns in the RETURNING clause.

export function runTableKeysTests(engine, create) {
  let db;

  test.serial(
    'database',
    async t => {
      db = await database({
        engine,
        tables: {
          users: {
            columns: 'key1:key key2:key name'
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
    'table insert with reload',
    async t => {
      const users = await db.table('users');
      const result = await users.insert(
        {
          key1: 'a',
          key2: 'b',
          name: 'Bobby Badger'
        },
      );
      t.is( result.key1, 'a' );
      t.is( result.key2, 'b' );
      t.is( result.name, 'Bobby Badger' );
    }
  )

  test.serial(
    'table insert without reload',
    async t => {
      const users = await db.table('users');
      const result = await users.insert(
        {
          key1: 'a',
          key2: 'b',
          name: 'Brian Badger'
        },
        { reload: false }
      );
      t.is( result.key1, 'a' );
      t.is( result.key2, 'b' );
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