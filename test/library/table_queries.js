import test from 'ava';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery } from './users_table.js';

export function runTableQueriesTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  const placeholder = engine === 'postgres' ? '$1' : '?';
  let db;

  test.serial( 'connect',
    t => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required animal',
            fragments: {
              select:
                'SELECT <columns> FROM <table>'
            },
            queries: {
              dropTable:
                'DROP TABLE IF EXISTS <table>',
              createTable:
                create,
              selectByName:
                `<select> WHERE name=${placeholder}`,
              selectByEmail:
                `<select> WHERE email=${placeholder}`,
              allBadgers:
                table => table.select().where({ animal: 'Badger' })
            }
          }
        }
      });
      t.pass();
    }
  )

  test.serial( 'drop table',
    async t => {
      const users = await db.table('users');
      await users.run('dropTable');
      t.pass();
    }
  )

  test.serial( 'create table',
    async t => {
      const users = await db.table('users');
      await users.run('createTable');
      t.pass();
    }
  );

  test.serial( 'insert a row',
    async t => {
      const users = await db.table('users');
      const result = await users.insert({
        name:   'Bobby Badger',
        email:  'bobby@badgerpower.com',
        animal: 'Badger'
      });
      t.is( result.id, 1 );
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'fetch one row',
    async t => {
      const users = await db.table('users');
      const bobby = await users.one(
        'selectByName',
        ['Bobby Badger']
      ).catch(
        e => console.log('one() failed: ', e)
      );
      t.is( bobby.id, 1 );
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial( 'fetch any row',
    async t => {
      const users = await db.table('users');
      const bobby = await users.any(
        'selectByName',
        ['Bobby Badger']
      );
      t.is( bobby.id, 1 );
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
    }
  )

  test.serial( 'fetch all rows',
    async t => {
      const users = await db.table('users');
      const bobbies = await users.all(
        'selectByName',
        ['Bobby Badger']
      );
      t.is( bobbies.length, 1 );
      t.is( bobbies[0].id, 1 );
      t.is( bobbies[0].name, 'Bobby Badger' );
      t.is( bobbies[0].email, 'bobby@badgerpower.com' );
    }
  )

  test.serial( 'fetch all badgers once',
    async t => {
      const users = await db.table('users');
      const values = users.query('allBadgers').allValues();
      t.deepEqual( values, ['Badger'] );
    }
  )

  test.serial( 'fetch all badgers twice',
    async t => {
      const users = await db.table('users');
      const values = users.query('allBadgers').allValues();
      t.deepEqual( values, ['Badger'] );
    }
  )

  test.serial( 'inspect fetch',
    async t => {
      const users = await db.table('users');
      const values = users.select().allValues();
      t.deepEqual( values, [] );
    }
  )

  test.after( 'disconnect',
    () => db.disconnect()
  )
}