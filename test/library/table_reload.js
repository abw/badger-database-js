import test from 'ava';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery } from './users_table.js';

export function runTableReloadTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test.serial(
    'connect',
    t => {
      db = connect({
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
    'table insert with reload',
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
      t.is( result.changes, undefined );
    }
  )

  test.serial(
    'table insert without reload',
    async t => {
      const users = await db.table('users');
      const result = await users.insert(
        {
          name:  'Brian Badger',
          email: 'brian@badgerpower.com'
        },
        { reload: false }
      );
      t.is( result.id, 2 );
      t.is( result.changes, 1 );
      t.is( result.name, undefined );
      t.is( result.email, undefined );
    }
  )

  test.after(
    () => db.disconnect()
  )
}