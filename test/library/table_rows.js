import test from 'ava';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery } from './users_table.js';

export function runTableRowsTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
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

  // fetch rows
  test.serial(
    'oneRow()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.oneRow({
        email: 'bobby@badgerpower.com'
      });
      t.is( bobby.name, 'Bobby Badger' );
    }
  )
  test.serial(
    'anyRow()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.anyRow({
        email: 'bobby@badgerpower.com'
      });
      t.is( bobby.name, 'Bobby Badger' );
    }
  )
  test.serial(
    'allRows()',
    async t => {
      const users = await db.table('users');
      const rows  = await users.allRows({
        email: 'bobby@badgerpower.com'
      });
      t.is( rows.length, 1 );
      t.is( rows[0].name, 'Bobby Badger' );
    }
  )
  test.serial(
    'allRows() with no spec',
    async t => {
      const users = await db.table('users');
      const rows  = await users.allRows();
      t.is( rows.length, 2 );
      t.is( rows[0].name, 'Bobby Badger' );
      t.is( rows[1].name, 'Brian Badger' );
    }
  )
  test.serial(
    'allRows() with empty spec',
    async t => {
      const users = await db.table('users');
      const rows  = await users.allRows({ });
      t.is( rows.length, 2 );
      t.is( rows[0].name, 'Bobby Badger' );
      t.is( rows[1].name, 'Brian Badger' );
    }
  )
  test.serial(
    'oneRow() with columns',
    async t => {
      const users = await db.table('users');
      const bobby = await users.oneRow(
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
      db.disconnect();
      t.pass();
    }
  )
}