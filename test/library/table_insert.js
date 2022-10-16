import test from 'ava';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery } from './users_table.js';

export function runTableInsertTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test.serial( 'connect',
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
      const result = await users.insert({
        name:  'Bobby Badger',
        email: 'bobby@badgerpower.com'
      });
      t.is( result.id, 1 );
      t.is( result.changes, 1 );
      t.is( result.name, undefined );
      t.is( result.email, undefined );
    }
  )

  test.serial( 'insert another row using insertOne()',
    async t => {
      const users = await db.table('users');
      const result = await users.insertOne(
        {
          name:  'Brian Badger',
          email: 'brian@badgerpower.com'
        },
        {
          reload: true
        }
      );
      t.is( result.id, 2 );
      t.is( result.name, 'Brian Badger' );
      t.is( result.email, 'brian@badgerpower.com' );
    }
  )

  test.serial( 'allRows()',
    async t => {
      // make sure we can fetch two rows
      const users = await db.table('users');
      const badgers = await users.allRows();    // why not all?
      t.is( badgers.length, 2 );
      t.is( badgers[0].name, 'Bobby Badger' );
      t.is( badgers[1].name, 'Brian Badger' );
    }
  )

  test.serial( 'insert multiple rows',
    async t => {
      const users = await db.table('users');
      const result = await users.insert([
        {
          name:  'Roger Rabbit',
          email: 'roger@badgerpower.com'
        },
        {
          name:  'Willy Weasel',
          email: 'willy@badgerpower.com'
        },
      ]);
      t.is( result.length, 2 );
      t.is( result[0].id, 3 );
      t.is( result[0].name, undefined );
      t.is( result[1].id, 4 );
      t.is( result[1].name, undefined );
    }
  )

  test.serial( 'insert multiple rows with reload',
    async t => {
      const users = await db.table('users');
      const result = await users.insert(
        [
          {
            name:  'Franky Ferret',
            email: 'franky@badgerpower.com'
          },
          {
            name:  'Simon Stoat',
            email: 'simon@badgerpower.com'
          },
        ],
        { reload: true }
      );
      t.is( result.length, 2 );
      t.is( result[0].id, 5 );
      t.is( result[0].name, 'Franky Ferret' );
      t.is( result[0].email, 'franky@badgerpower.com' );
      t.is( result[1].id, 6 );
      t.is( result[1].name, 'Simon Stoat' );
      t.is( result[1].email, 'simon@badgerpower.com' );
    }
  )

  test.serial( 'insert multiple rows using insertAll()',
    async t => {
      const users = await db.table('users');
      const result = await users.insertAll([
        {
          name:  'Edward Elephant',
          email: 'edward@badgerpower.com'
        },
        {
          name:  'Alan Aaardvark',
          email: 'alan@badgerpower.com'
        },
      ]);
      t.is( result.length, 2 );
      t.is( result[0].id, 7 );
      t.is( result[0].name, undefined );
      t.is( result[1].id, 8 );
      t.is( result[1].name, undefined );
    }
  )

  test.serial( 'insert multiple rows using insertAll() with reload',
    async t => {
      const users = await db.table('users');
      const result = await users.insertAll(
        [
          {
            name:  'Hector Horse',
            email: 'hector@badgerpower.com'
          },
          {
            name:  'Ian Iguana',
            email: 'ian@badgerpower.com'
          },
        ],
        { reload: true }
      );
      t.is( result.length, 2 );
      t.is( result[0].id, 9 );
      t.is( result[0].name, 'Hector Horse' );
      t.is( result[1].id, 10 );
      t.is( result[1].name, 'Ian Iguana' );
    }
  )

  test.after( 'disconnect',
    () => db.disconnect()
  )
}