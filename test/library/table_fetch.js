import test from 'ava';
import { database } from '../../src/Database.js';

export function runTableFetchTests(engine, create) {
  let db;

  // connect to the database
  test.serial(
    'database',
    async t => {
      db = await database({
        engine: engine,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required'
          }
        }
      });
      t.pass();
    }
  )

  // drop any existing users table
  test.serial(
    'drop table',
    async t => {
      await db.run(
        `DROP TABLE IF EXISTS users`
      )
      t.pass();
    }
  )

  // create the table
  test.serial(
    'create table',
    async t => {
      await db.run(create);
      t.pass();
    }
  );

  // insert a couple of rows
  test.serial(
    'table insert',
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
  test.serial(
    'table insert another row',
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

  // fetch rows
  test.serial(
    'table fetch one',
    async t => {
      const users = await db.table('users');
      const bobby = await users.fetchOne({
        email: 'bobby@badgerpower.com'
      });
      t.is( bobby.name, 'Bobby Badger' );
    }
  )
  test.serial(
    'table fetch any',
    async t => {
      const users = await db.table('users');
      const bobby = await users.fetchAny({
        email: 'bobby@badgerpower.com'
      });
      t.is( bobby.name, 'Bobby Badger' );
    }
  )
  test.serial(
    'table fetch all',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetchAll({
        email: 'bobby@badgerpower.com'
      });
      t.is( rows.length, 1 );
      t.is( rows[0].name, 'Bobby Badger' );
    }
  )
  test.serial(
    'table fetch all with no spec',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetchAll();
      t.is( rows.length, 2 );
      t.is( rows[0].name, 'Bobby Badger' );
      t.is( rows[1].name, 'Brian Badger' );
    }
  )
  test.serial(
    'table fetch all with empty spec',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetchAll({ });
      t.is( rows.length, 2 );
      t.is( rows[0].name, 'Bobby Badger' );
      t.is( rows[1].name, 'Brian Badger' );
    }
  )
  test.serial(
    'table fetch with columns',
    async t => {
      const users = await db.table('users');
      const bobby = await users.fetchOne(
        {
          email: 'bobby@badgerpower.com'
        },
        {
          columns: 'id name'
        }
      );
      t.is( bobby.id, 1 );
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, undefined );
    }
  )

  // cleanup
  test.serial(
    'destroy',
    t => {
      db.destroy();
      t.pass();
    }
  )
}