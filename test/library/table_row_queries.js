import test from 'ava';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery, dropUsersTableQuery } from './users_table.js';

export function runTableRowQueries(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  // connect to the database
  test.serial(
    'database',
    t => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required',
            queries: {
              all:     t => t.fetch,
              byName:  t => t.fetch.where('name'),
              byEmail: t => t.fetch.where('email')
            }
          },
        }
      });
      t.pass();
    }
  )

  // drop any existing users table
  test.serial(
    'drop table',
    async t => {
      await db.run(dropUsersTableQuery)
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
      const result = await users.insert([
        {
          name:  'Bobby Badger',
          email: 'bobby@badgerpower.com'
        },
        {
          name:  'Brian Badger',
          email: 'brian@badgerpower.com'
        },
      ]);
      t.is( result.length, 2 );
    }
  )

  test.serial(
    'one()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.one('byEmail', ['bobby@badgerpower.com']);
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial(
    'any()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.any('byEmail', ['bobby@badgerpower.com']);
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial(
    'all()',
    async t => {
      const users = await db.table('users');
      const rows  = await users.all(users.fetch);
      t.is( rows.length, 2 );
      t.is( rows[0].name,  'Bobby Badger' );
      t.is( rows[0].email, 'bobby@badgerpower.com' );
      t.is( rows[1].name,  'Brian Badger' );
      t.is( rows[1].email, 'brian@badgerpower.com' );
    }
  )

  test.serial(
    'selectOneRow()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.selectOneRow('byEmail', ['bobby@badgerpower.com']);
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial(
    'oneRow()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.oneRow('byEmail', ['bobby@badgerpower.com']);
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial(
    'selectAnyRow()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.selectAnyRow('byEmail', ['bobby@badgerpower.com']);
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial(
    'anyRow()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.anyRow('byEmail', ['bobby@badgerpower.com']);
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial(
    'selectAllRows()',
    async t => {
      const users = await db.table('users');
      const rows  = await users.selectAllRows('all');
      t.is( rows.length, 2 );
      t.is( rows[0].name,  'Bobby Badger' );
      t.is( rows[0].email, 'bobby@badgerpower.com' );
      t.is( rows[1].name,  'Brian Badger' );
      t.is( rows[1].email, 'brian@badgerpower.com' );
    }
  )

  test.serial(
    'allRows()',
    async t => {
      const users = await db.table('users');
      const rows = await users.allRows('all');
      t.is( rows.length, 2 );
      t.is( rows[0].name,  'Bobby Badger' );
      t.is( rows[0].email, 'bobby@badgerpower.com' );
      t.is( rows[1].name,  'Brian Badger' );
      t.is( rows[1].email, 'brian@badgerpower.com' );
    }
  )

  test.after(
    () => db.disconnect()
  )
}