import test from 'ava';
import { connect } from '../../src/Database.js';
import Record from '../../src/Record.js';

export function runTableRecordsTests(database, create) {
  let db;

  // connect to the database
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
    'insert a row',
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
    'insert another row',
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

  // fetch records
  test.serial(
    'oneRecord()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.oneRecord({
        email: 'bobby@badgerpower.com'
      });
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof Record, true );
    }
  )

  test.serial(
    'anyRecord()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.anyRecord({
        email: 'bobby@badgerpower.com'
      });
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof Record, true );
    }
  )

  test.serial(
    'allRecords()',
    async t => {
      const users = await db.table('users');
      const recs  = await users.allRecords({
        email: 'bobby@badgerpower.com'
      });
      t.is( recs.length, 1 );
      t.is( recs[0].row.name, 'Bobby Badger' );
      t.is( recs[0].row.email, 'bobby@badgerpower.com' );
      t.is( recs[0] instanceof Record, true );
    }
  )
  test.serial(
    'allRecords() with no spec',
    async t => {
      const users = await db.table('users');
      const recs  = await users.allRecords();
      t.is( recs.length, 2 );
      t.is( recs[0].row.name, 'Bobby Badger' );
      t.is( recs[0].row.email, 'bobby@badgerpower.com' );
      t.is( recs[0] instanceof Record, true );
      t.is( recs[1].row.name, 'Brian Badger' );
      t.is( recs[1].row.email, 'brian@badgerpower.com' );
      t.is( recs[1] instanceof Record, true );
    }
  )
  test.serial(
    'allRecords() with empty spec',
    async t => {
      const users = await db.table('users');
      const recs  = await users.allRecords({ });
      t.is( recs.length, 2 );
      t.is( recs[0].row.name, 'Bobby Badger' );
      t.is( recs[0].row.email, 'bobby@badgerpower.com' );
      t.is( recs[0] instanceof Record, true );
      t.is( recs[1].row.name, 'Brian Badger' );
      t.is( recs[1].row.email, 'brian@badgerpower.com' );
      t.is( recs[1] instanceof Record, true );
    }
  )
  test.serial(
    'oneRecord() with columns',
    async t => {
      const users = await db.table('users');
      const bobby = await users.oneRecord(
        {
          email: 'bobby@badgerpower.com'
        },
        {
          columns: 'id name'
        }
      );
      t.is( bobby.row.id, 1 );
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, undefined );
      t.is( bobby instanceof Record, true );
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