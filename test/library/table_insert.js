import test from 'ava';
import { database } from '../../src/Database.js';

export function runTableInsertTests(engine, create) {
  let db;

  // connect
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

  // drop any existing table
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

  // insert a row
  test.serial(
    'insert a row',
    async t => {
      const users = await db.table('users');
      const result = await users.insert({
        name:  'Bobby Badger',
        email: 'bobby@badgerpower.com'
      });
      t.is( result.id, 1 );
      t.is( result.name, 'Bobby Badger' );
      t.is( result.email, 'bobby@badgerpower.com' );
    }
  )

  // insert another row
  test.serial(
    'insert another row',
    async t => {
      const users = await db.table('users');
      const result = await users.insert({
        name:  'Brian Badger',
        email: 'brian@badgerpower.com'
      });
      t.is( result.id, 2 );
      t.is( result.name, 'Brian Badger' );
      t.is( result.email, 'brian@badgerpower.com' );
    }
  )

  // make sure we can fetch two rows
  test.serial(
    'fetch all',
    async t => {
      const users = await db.table('users');
      const badgers = await users.fetchAll();
      t.is( badgers.length, 2 );
      t.is( badgers[0].name, 'Bobby Badger' );
      t.is( badgers[1].name, 'Brian Badger' );
    }
  )

  // insert multiple rows
  test.serial(
    'insert multiple rows',
    async t => {
      const users = await db.table('users');
      const result = await users.insert([
        {
          name:  'Franky Ferret',
          email: 'franky@badgerpower.com'
        },
        {
          name:  'Simon Stoat',
          email: 'simon@badgerpower.com'
        },
      ]);
      t.is( result.length, 2 );
      t.is( result[0].id, 3 );
      t.is( result[0].name, 'Franky Ferret' );
      t.is( result[0].email, 'franky@badgerpower.com' );
      t.is( result[1].id, 4 );
      t.is( result[1].name, 'Simon Stoat' );
      t.is( result[1].email, 'simon@badgerpower.com' );
    }
  )

  // cleanup
  test.after(
    'destroy',
    t => {
      db.destroy();
      t.pass();
    }
  )
}