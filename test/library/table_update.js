import test from 'ava';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery } from './users_table.js';

export function runTableUpdateTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test.serial(
    'connect',
    async t => {
      db = await connect({
        database,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required friends'
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
        name:   'Bobby Badger',
        email:  'bobby@badgerpower.com',
        friends: 1,
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
        { name:  'Roberto Badger' },
        { email: 'bobby@badgerpower.com' }
      );
      t.is( result.changes, 1 );
    }
  )

  test.serial(
    'table update one',
    async t => {
      const users = await db.table('users');
      const result = await users.updateOne(
        { name:  'Roberto Badger' },
        { email: 'bobby@badgerpower.com' }
      );
      t.is( result.changes, 1 );
    }
  )

  test.serial(
    'table update one, not found',
    async t => {
      const users = await db.table('users');
      const error = await t.throwsAsync(
        () => users.updateOne(
          { name:  'Roberto Badger' },
          { email: 'bobby@badgerpower.co.uk' }
        )
      );
      t.is( error.message, "0 rows were updated when one was expected" );
    }
  )

  test.serial(
    'table update one with reload',
    async t => {
      const users = await db.table('users');
      const result = await users.updateOne(
        { name:  'Robert Badger' },
        { email: 'bobby@badgerpower.com' },
        { reload: true }
      );
      t.is( result.changes, undefined );
      t.is( result.id, 1 );
      t.is( result.name, 'Robert Badger' );
      t.is( result.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial(
    'table update any',
    async t => {
      const users = await db.table('users');
      const result = await users.updateAny(
        { name:  'Roberto Badger' },
        { email: 'bobby@badgerpower.com' }
      );
      t.is( result.changes, 1 );
    }
  )

  test.serial(
    'table update any not found',
    async t => {
      const users = await db.table('users');
      const result = await users.updateAny(
        { name:  'Roberto Badger' },
        { email: 'bobby@badgerpower.co.uk' }
      );
      t.is( result.changes, 0 );
    }
  )

  test.serial(
    'table update any with reload',
    async t => {
      const users = await db.table('users');
      const result = await users.updateAny(
        { name:  'Robbie Badger' },
        { email: 'bobby@badgerpower.com' },
        { reload: true }
      );
      t.is( result.changes, undefined );
      t.is( result.id, 1 );
      t.is( result.name, 'Robbie Badger' );
      t.is( result.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial(
    'table update any with reload on changed item',
    async t => {
      const users = await db.table('users');
      const result = await users.updateAny(
        { email: 'robbie@badgerpower.com' },
        { email: 'bobby@badgerpower.com' },
        { reload: true }
      );
      t.is( result.changes, undefined );
      t.is( result.id, 1 );
      t.is( result.name, 'Robbie Badger' );
      t.is( result.email, 'robbie@badgerpower.com' );
    }
  )

  test.serial(
    'table update any with reload on changed item which is 0',
    async t => {
      const users = await db.table('users');
      const result = await users.updateAny(
        { friends: 0 },
        { email: 'robbie@badgerpower.com', friends: 1 },
        { reload: true }
      );
      t.is( result.changes, undefined );
      t.is( result.id, 1 );
      t.is( result.name, 'Robbie Badger' );
      t.is( result.email, 'robbie@badgerpower.com' );
      t.is( result.friends, 0 );
    }
  )

  test.serial(
    'table update any not found with reload',
    async t => {
      const users = await db.table('users');
      const result = await users.updateAny(
        { name:  'Robbie Badger' },
        { email: 'bobby@badgerpower.co.uk' },
        { reload: true }
      );
      t.is( result, undefined );
    }
  )

  test.serial(
    'destroy',
    t => {
      db.disconnect();
      t.pass();
    }
  )
}