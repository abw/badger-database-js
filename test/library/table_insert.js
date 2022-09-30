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

  // insert another row
  test.serial(
    'table insert again',
    async t => {
      const users = await db.table('users');
      const result = await users.insert({
        name:  'Brian Badger',
        email: 'brian@badgerpower.com'
      });
      t.is( result.id, 2 );
      t.is( result.changes, 1 );
    }
  )

  // make sure we can fetch two rows
  test.serial(
    'table fetch all',
    async t => {
      const users = await db.table('users');
      const badgers = await users.fetchAll();
      t.is( badgers.length, 2 );
      t.is( badgers[0].name, 'Bobby Badger' );
      t.is( badgers[1].name, 'Brian Badger' );
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