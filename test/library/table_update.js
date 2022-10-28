import test from 'ava';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery } from './users_table.js';

export function runTableUpdateTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test.serial( 'connect',
    t => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required friends',
            debug: false

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
      const result = await users.insert({
        name:   'Bobby Badger',
        email:  'bobby@badgerpower.com',
        friends: 1,
      });
      t.is( result.id, 1 );
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'update()',
    async t => {
      const users = await db.table('users');
      const result = await users.update(
        { name:  'Roberto Badger' },
        { email: 'bobby@badgerpower.com' }
      );
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'updateOne()',
    async t => {
      const users = await db.table('users');
      const result = await users.updateOne(
        { name:  'Roberto Badger' },
        { email: 'bobby@badgerpower.com' }
      );
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'updateOne(), not found',
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

  test.serial( 'updateOne() with reload',
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

  test.serial( 'updateOneRow()',
    async t => {
      const users = await db.table('users');
      const result = await users.updateOneRow(
        { name:  'Robby Badger' },
        { email: 'bobby@badgerpower.com' },
      );
      t.is( result.changes, undefined );
      t.is( result.id, 1 );
      t.is( result.name, 'Robby Badger' );
      t.is( result.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial( 'updateRow()',
    async t => {
      const users = await db.table('users');
      const result = await users.updateRow(
        { name:  'Rob Badger' },
        { email: 'bobby@badgerpower.com' },
      );
      t.is( result.changes, undefined );
      t.is( result.id, 1 );
      t.is( result.name, 'Rob Badger' );
      t.is( result.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial( 'updateAny()',
    async t => {
      const users = await db.table('users');
      const result = await users.updateAny(
        { name:  'Roberto Badger' },
        { email: 'bobby@badgerpower.com' }
      );
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'updateAny() not found',
    async t => {
      const users = await db.table('users');
      const result = await users.updateAny(
        { name:  'Roberto Badger' },
        { email: 'bobby@badgerpower.co.uk' }
      );
      t.is( result.changes, 0 );
    }
  )

  test.serial( 'updateAny() with reload',
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

  test.serial( 'updateAnyRow()',
    async t => {
      const users = await db.table('users');
      const result = await users.updateAnyRow(
        { name:  'Bobby Badger' },
        { email: 'bobby@badgerpower.com' },
      );
      t.is( result.changes, undefined );
      t.is( result.id, 1 );
      t.is( result.name, 'Bobby Badger' );
      t.is( result.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial( 'updateAny() with reload on changed item',
    async t => {
      const users = await db.table('users');
      const result = await users.updateAny(
        { email: 'robbie@badgerpower.com', name: 'Robbie Badger' },
        { email: 'bobby@badgerpower.com' },
        { reload: true }
      );
      t.is( result.changes, undefined );
      t.is( result.id, 1 );
      t.is( result.name, 'Robbie Badger' );
      t.is( result.email, 'robbie@badgerpower.com' );
    }
  )

  test.serial( 'updateAny() with reload on changed item which is 0',
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

  test.serial( 'updateAny() not found with reload',
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

  test.serial( 'updateAll() not found',
    async t => {
      const users = await db.table('users');
      const result = await users.updateAll(
        { name:  'Robbie Badger' },
        { email: 'bobby@badgerpower.co.uk' },
      );
      t.is( result.changes, 0 );
    }
  )

  test.serial( 'updateAll() not found with reload error',
    async t => {
      const users = await db.table('users');
      const error = await t.throwsAsync(
        () => users.updateAll(
          { name:  'Robbie Badger' },
          { email: 'bobby@badgerpower.co.uk' },
          { reload: true }
        )
      );
      t.is( error.message, "Cannot reload multiple updated rows" );
    }
  )

  test.serial( 'insert another row',
    async t => {
      const users = await db.table('users');
      const result = await users.insert({
        name:   'Brian Badger',
        email:  'brian@badgerpower.com',
        friends: 1,
      });
      t.is( result.id, 2 );
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'updateAny() with negative email comparison',
    async t => {
      const users = await db.table('users');
      const result = await users.updateAny(
        { email: 'brian-badger@badgerpower.com' },
        { email: ['!=', 'robbie@badgerpower.com'] },
        { reload: true }
      );
      t.is( result.changes, undefined );
      t.is( result.id, 2 );
      t.is( result.name, 'Brian Badger' );
      t.is( result.email, 'brian-badger@badgerpower.com' );
    }
  )

  test.after( 'disconnect',
    () => db.disconnect()
  )
}