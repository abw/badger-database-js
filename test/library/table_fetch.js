import test from 'ava';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery } from './users_table.js';

export function runTableFetchTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test.serial( 'connect',
    t => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required animal',
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

  test.serial( 'insert rows',
    async t => {
      const users = await db.table('users');
      const result = await users.insert([
        {
          name:   'Frank Ferret',
          email:  'frank@badgerpower.com',
          animal: 'Ferret',
        },
        {
          name:   'Bobby Badger',
          email:  'bobby@badgerpower.com',
          animal: 'Badger',
        },
        {
          name:   'Brian Badger',
          email:  'brian@badgerpower.com',
          animal: 'Badger',
        },
      ]);
      t.is( result.length, 3 );
    }
  )

  test.serial( 'fetch() returning many',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetch({
        animal: 'Badger'
      });
      t.is( rows.length, 2 );
      t.is( rows[0].name, 'Bobby Badger' );
      t.is( rows[1].name, 'Brian Badger' );
    }
  )

  test.serial( 'fetchOne()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.fetchOne({
        email: 'bobby@badgerpower.com'
      });
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby.friends, undefined );
    }
  )

  test.serial( 'fetchAny()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.fetchAny({
        email: 'bobby@badgerpower.com'
      });
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby.friends, undefined );
    }
  )

  test.serial( 'fetchAll() returning one',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetchAll({
        email: 'bobby@badgerpower.com'
      });
      t.is( rows.length, 1 );
      t.is( rows[0].name, 'Bobby Badger' );
      t.is( rows[0].email, 'bobby@badgerpower.com' );
      t.is( rows[0].friends, undefined );
    }
  )

  test.serial( 'fetchAll() returning many',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetchAll({
        animal: 'Badger'
      });
      t.is( rows.length, 2 );
      t.is( rows[0].name, 'Bobby Badger' );
      t.is( rows[1].name, 'Brian Badger' );
    }
  )

  test.serial( 'fetchAll() with no spec',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetchAll();
      t.is( rows.length, 3 );
      t.is( rows[0].name, 'Frank Ferret' );
      t.is( rows[1].name, 'Bobby Badger' );
      t.is( rows[2].name, 'Brian Badger' );
    }
  )

  test.serial( 'fetchAll() with empty spec',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetchAll({ });
      t.is( rows.length, 3 );
      t.is( rows[0].name, 'Frank Ferret' );
      t.is( rows[1].name, 'Bobby Badger' );
      t.is( rows[2].name, 'Brian Badger' );
    }
  )

  test.serial( 'fetchAll() with order',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetchAll({ }, { order: 'name' });
      t.is( rows.length, 3 );
      t.is( rows[0].name, 'Bobby Badger' );
      t.is( rows[1].name, 'Brian Badger' );
      t.is( rows[2].name, 'Frank Ferret' );
    }
  )

  test.serial( 'fetchAll() with multiple order columns',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetchAll({ }, { order: 'animal, name' });
      t.is( rows.length, 3 );
      t.is( rows[0].name, 'Bobby Badger' );
      t.is( rows[1].name, 'Brian Badger' );
      t.is( rows[2].name, 'Frank Ferret' );
    }
  )

  test.serial( 'fetchAll() with order DESC',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetchAll({ }, { order: { sql: 'name DESC' } });
      t.is( rows.length, 3 );
      t.is( rows[0].name, 'Frank Ferret' );
      t.is( rows[1].name, 'Brian Badger' );
      t.is( rows[2].name, 'Bobby Badger' );
    }
  )

  test.serial( 'fetchAll() with orderBy',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetchAll({ }, { orderBy: { sql: 'name DESC' } });
      t.is( rows.length, 3 );
      t.is( rows[0].name, 'Frank Ferret' );
      t.is( rows[1].name, 'Brian Badger' );
      t.is( rows[2].name, 'Bobby Badger' );
    }
  )

  test.serial( 'fetchAll() with name comparison',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetchAll({
        name: ['!=', 'Bobby Badger']
      });
      t.is( rows.length, 2 );
      t.is( rows[0].name, 'Frank Ferret' );
      t.is( rows[1].name, 'Brian Badger' );
    }
  )

  test.serial( 'fetchAll() with name comparison and order',
    async t => {
      const users = await db.table('users');
      const rows  = await users.fetchAll(
        { name: ['!=', 'Bobby Badger'] },
        { order: 'name' }
      );
      t.is( rows.length, 2 );
      t.is( rows[0].name, 'Brian Badger' );
      t.is( rows[1].name, 'Frank Ferret' );
    }
  )

  test.serial( 'fetchOne() with columns',
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
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, undefined );
      t.is( bobby.friends, undefined );
    }
  )

  test.after( 'disconnect',
    () => db.disconnect()
  )
}