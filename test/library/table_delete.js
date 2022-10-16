import test from 'ava';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery } from './users_table.js';

export function runTableDeleteTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test.before( 'connect',
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

  test.serial( 'insert a row',
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

  test.serial( 'insert another row',
    async t => {
      const users = await db.table('users');
      const result = await users.insert(
        {
          name:  'Brian Badger',
          email: 'brian@badgerpower.com'
        },
        { reload: true }
      );
      t.is( result.id, 2 );
      t.is( result.name, 'Brian Badger' );
      t.is( result.email, 'brian@badgerpower.com' );
    }
  )

  test.serial( 'insert yet another row',
    async t => {
      const users = await db.table('users');
      const result = await users.insert(
        {
          name:  'Frank Ferret',
          email: 'frank@badgerpower.com'
        },
        { reload: true }
      );
      t.is( result.id, 3 );
      t.is( result.name, 'Frank Ferret' );
      t.is( result.email, 'frank@badgerpower.com' );
    }
  )

  test.serial( 'fetch all',
    async t => {
      const users = await db.table('users');
      const rows = await users.allRows();
      t.is( rows.length, 3 );
    }
  )

  test.serial( 'delete first row',
    async t => {
      const users = await db.table('users');
      const result = await users.delete({
        email: 'bobby@badgerpower.com'
      });
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'fetch two',
    async t => {
      const users = await db.table('users');
      const rows = await users.allRows();
      t.is( rows.length, 2 );
    }
  )

  test.serial( 'delete second row with comparison',
    async t => {
      const users = await db.table('users');
      const result = await users.delete({
        id: ['>', 2]
      });
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'fetch one',
    async t => {
      const users = await db.table('users');
      const rows = await users.allRows();
      t.is( rows.length, 1 );
    }
  )

  test.serial( 'delete all rows',
    async t => {
      const users = await db.table('users');
      const result = await users.delete();
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'fetch none',
    async t => {
      const users = await db.table('users');
      const rows = await users.allRows();
      t.is( rows.length, 0 );
    }
  )

  test.after( 'disconnect',
    () => db.disconnect()
  )
}