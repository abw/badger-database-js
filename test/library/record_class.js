import test from 'ava';
import Record from '../../src/Record.js';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery } from './users_table.js';

export class User extends Record {
  hello() {
    return `${this.config.hello || 'Hello'} ${this.row.name}`;
  }
}

export function runRecordClassTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  // connect to the database
  test.before(
    'database',
    t => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required',
            recordClass: User,
          },
          casual_users: {
            table: 'users',
            columns: 'id:readonly name:required email:required',
            recordClass: User,
            recordConfig: {
              hello: 'Hiya'
            }
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

  // insert a row
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

  // fetch records
  test.serial(
    'hello() method',
    async t => {
      const users = await db.table('users');
      const bobby = await users.oneRecord({
        email: 'bobby@badgerpower.com'
      });
      // console.log('oneRecord() returned: ', bobby);
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof User, true );
      t.is( bobby.hello(), 'Hello Bobby Badger' );
    }
  )

  test.serial(
    'hello() method with record options',
    async t => {
      const users = await db.table('casual_users');
      const bobby = await users.oneRecord({
        email: 'bobby@badgerpower.com'
      });
      // console.log('oneRecord() returned: ', bobby);
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof User, true );
      t.is( bobby.hello(), 'Hiya Bobby Badger' );
    }
  )

  // cleanup
  test.after(
    () => db.disconnect()
  )
}