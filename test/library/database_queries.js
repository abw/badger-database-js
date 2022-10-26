import test from 'ava';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery } from './users_table.js';

export function runDatabaseQueryTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test.before( 'connect',
    () => {
      db = connect({
        database,
      });
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
      const result = await db
        .insert('name email')
        .into('users')
        .run(
          [ 'Bobby Badger', 'bobby@badgerpower.com' ],
          { sanitizeResult: true }
        );
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'insert another row providing values in query',
    async t => {
      const result = await db
        .insert('name email')
        .into('users')
        .values('Brian Badger', 'brian@badgerpower.com')
        .run([], { sanitizeResult: true })
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'select all rows',
    async t => {
      const badgers = await db
        .select('name')
        .from('users')
        .all()
      t.is( badgers.length, 2 );
      t.is( badgers[0].name, 'Bobby Badger' );
      t.is( badgers[1].name, 'Brian Badger' );
    }
  )

  test.serial( 'update a row',
    async t => {
      const result = await db
        .update('users')
        .set('name')
        .where('email')
        .run(
          ['Brian the Badger', 'brian@badgerpower.com'],
          { sanitizeResult: true }
        )
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'update a row with values provided',
    async t => {
      const result = await db
        .update('users')
        .set({ name: 'Bobby the Badger' })
        .where({ email: 'bobby@badgerpower.com' })
        .run([], { sanitizeResult: true })
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'select Brian the Badger',
    async t => {
      const brian = await db
        .select('name')
        .from('users')
        .where('email')
        .one(['brian@badgerpower.com'])
      t.is( brian.name, 'Brian the Badger' );
    }
  )

  test.serial( 'select Bobby the Badger with values provided',
    async t => {
      const bobby = await db
        .select('name')
        .from('users')
        .where(['email', 'bobby@badgerpower.com'])
        .one()
      t.is( bobby.name, 'Bobby the Badger' );
    }
  )

  test.serial( 'delete Brian the Badger',
    async t => {
      const result = await db
        .delete()
        .from('users')
        .where('email')
        .run(['brian@badgerpower.com'], { sanitizeResult: true })
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'delete Bobby the Badger with values provided',
    async t => {
      const result = await db
        .delete()
        .from('users')
        .where(['email', 'bobby@badgerpower.com'])
        .run([], { sanitizeResult: true })
      t.is( result.changes, 1 );
    }
  )

  test.serial( 'fetch none more badgers',
    async t => {
      const badgers = await db
        .select('name')
        .from('users')
        .all()
      t.is( badgers.length, 0 );
    }
  )

  test.after( 'disconnect',
    () => db.disconnect()
  )
}