import test from 'ava';
import Record from '../../src/Record.js';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery } from './users_table.js';
import { DeletedRecordError } from '../../src/Utils/Error.js';

export function runTableRecordsTests(engine) {
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
            columns: 'id:readonly name:required email:required animal',
            queries: {
              byName:  table => table.fetch.where('name'),
              badgers: table => table.fetch.where({ animal: 'Badger' })
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

  // insert some rows
  test.serial(
    'insert a row',
    async t => {
      const users = await db.table('users');
      const result = await users.insert(
        {
          name:  'Bobby Badger',
          email: 'bobby@badgerpower.com',
          animal: 'Badger',
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
          name:   'Brian Badger',
          email:  'brian@badgerpower.com',
          animal: 'Badger',
        },
        { reload: true }
      );
      t.is( result.id, 2 );
      t.is( result.name, 'Brian Badger' );
      t.is( result.email, 'brian@badgerpower.com' );
    }
  )
  test.serial(
    'insert multiple rows',
    async t => {
      const users = await db.table('users');
      const result = await users.insert([
        {
          name:   'Frank Ferret',
          email:  'frank@badgerpower.com',
          animal: 'Ferret',
        },
        {
          name:   'Simon Stoat',
          email:  'frank@badgerpower.com',
          animal: 'Ferret',
        },
      ]);
      t.is( result.length, 2 );
    }
  )

  // one methods
  test.serial(
    'fetchOneRecord()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.fetchOneRecord({
        email: 'bobby@badgerpower.com'
      });
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof Record, true );
    }
  )
  test.serial(
    'fetchRecord()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.fetchRecord({
        email: 'bobby@badgerpower.com'
      });
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof Record, true );
    }
  )
  test.serial(
    'selectOneRecord()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.selectOneRecord(
        'byName', ['Bobby Badger']
      );
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof Record, true );
    }
  )
  test.serial(
    'selectRecord()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.selectRecord(
        'byName', ['Bobby Badger']
      );
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof Record, true );
    }
  )
  test.serial(
    'oneRecord() with data',
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
      t.is( bobby instanceof Record, true );
    }
  )
  test.serial(
    'oneRecord() with query',
    async t => {
      const users = await db.table('users');
      const bobby = await users.oneRecord(
        'byName', ['Bobby Badger']
      );
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof Record, true );
    }
  )

  // any
  test.serial(
    'fetchAnyRecord()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.fetchAnyRecord({
        email: 'bobby@badgerpower.com'
      });
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof Record, true );
    }
  )
  test.serial(
    'selectAnyRecord()',
    async t => {
      const users = await db.table('users');
      const bobby = await users.selectAnyRecord(
        'byName', ['Bobby Badger']
      );
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof Record, true );
    }
  )
  test.serial(
    'anyRecord() with data',
    async t => {
      const users = await db.table('users');
      const bobby = await users.anyRecord({
        email: 'bobby@badgerpower.com'
      });
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof Record, true );
    }
  )
  test.serial(
    'anyRecord() with query',
    async t => {
      const users = await db.table('users');
      const bobby = await users.anyRecord(
        'byName', ['Bobby Badger']
      );
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof Record, true );
    }
  )

  // all
  test.serial(
    'fetchAllRecords()',
    async t => {
      const users = await db.table('users');
      const recs  = await users.fetchAllRecords({
        email: 'bobby@badgerpower.com'
      });
      t.is( recs.length, 1 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0].email, 'bobby@badgerpower.com' );
      t.is( recs[0].row.name, 'Bobby Badger' );
      t.is( recs[0].row.email, 'bobby@badgerpower.com' );
      t.is( recs[0] instanceof Record, true );
    }
  )
  test.serial(
    'fetchRecords()',
    async t => {
      const users = await db.table('users');
      const recs  = await users.fetchRecords({
        email: 'bobby@badgerpower.com'
      });
      t.is( recs.length, 1 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0].email, 'bobby@badgerpower.com' );
      t.is( recs[0].row.name, 'Bobby Badger' );
      t.is( recs[0].row.email, 'bobby@badgerpower.com' );
      t.is( recs[0] instanceof Record, true );
    }
  )
  test.serial(
    'selectAllRecords()',
    async t => {
      const users = await db.table('users');
      const recs  = await users.selectAllRecords(
        'byName', ['Bobby Badger'],
      );
      t.is( recs.length, 1 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0].email, 'bobby@badgerpower.com' );
      t.is( recs[0].row.name, 'Bobby Badger' );
      t.is( recs[0].row.email, 'bobby@badgerpower.com' );
      t.is( recs[0] instanceof Record, true );
    }
  )
  test.serial(
    'selectRecords()',
    async t => {
      const users = await db.table('users');
      const recs  = await users.selectRecords(
        'byName', ['Bobby Badger'],
      );
      t.is( recs.length, 1 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0].email, 'bobby@badgerpower.com' );
      t.is( recs[0].row.name, 'Bobby Badger' );
      t.is( recs[0].row.email, 'bobby@badgerpower.com' );
      t.is( recs[0] instanceof Record, true );
    }
  )

  test.serial(
    'allRecords() with data',
    async t => {
      const users = await db.table('users');
      const recs  = await users.allRecords({
        email: 'bobby@badgerpower.com'
      });
      t.is( recs.length, 1 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0].email, 'bobby@badgerpower.com' );
      t.is( recs[0].row.name, 'Bobby Badger' );
      t.is( recs[0].row.email, 'bobby@badgerpower.com' );
      t.is( recs[0] instanceof Record, true );
    }
  )
  test.serial(
    'allRecords() with query',
    async t => {
      const users = await db.table('users');
      const recs  = await users.allRecords(
        'byName', ['Bobby Badger']
      );
      t.is( recs.length, 1 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0].email, 'bobby@badgerpower.com' );
      t.is( recs[0].row.name, 'Bobby Badger' );
      t.is( recs[0].row.email, 'bobby@badgerpower.com' );
      t.is( recs[0] instanceof Record, true );
    }
  )

  test.serial(
    'fetchAllRecords() multiple rows',
    async t => {
      const users = await db.table('users');
      const recs  = await users.fetchAllRecords({
        animal: 'Badger'
      });
      t.is( recs.length, 2 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0] instanceof Record, true );
      t.is( recs[1].name, 'Brian Badger' );
      t.is( recs[1] instanceof Record, true );
    }
  )
  test.serial(
    'fetchRecords() multiple rows',
    async t => {
      const users = await db.table('users');
      const recs  = await users.fetchRecords({
        animal: 'Badger'
      });
      t.is( recs.length, 2 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0] instanceof Record, true );
      t.is( recs[1].name, 'Brian Badger' );
      t.is( recs[1] instanceof Record, true );
    }
  )
  test.serial(
    'selectAllRecords() multiple rows',
    async t => {
      const users = await db.table('users');
      const recs  = await users.selectAllRecords('badgers');
      t.is( recs.length, 2 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0] instanceof Record, true );
      t.is( recs[1].name, 'Brian Badger' );
      t.is( recs[1] instanceof Record, true );
    }
  )
  test.serial(
    'selectRecords() multiple rows',
    async t => {
      const users = await db.table('users');
      const recs  = await users.selectRecords('badgers');
      t.is( recs.length, 2 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0] instanceof Record, true );
      t.is( recs[1].name, 'Brian Badger' );
      t.is( recs[1] instanceof Record, true );
    }
  )

  test.serial(
    'allRecords() with query multiple rows',
    async t => {
      const users = await db.table('users');
      const recs  = await users.allRecords('badgers');
      t.is( recs.length, 2 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0] instanceof Record, true );
      t.is( recs[1].name, 'Brian Badger' );
      t.is( recs[1] instanceof Record, true );
    }
  )
  test.serial(
    'allRecords() with query multiple rows repeated',
    async t => {
      const users = await db.table('users');
      const recs  = await users.allRecords('badgers');
      t.is( recs.length, 2 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0] instanceof Record, true );
      t.is( recs[1].name, 'Brian Badger' );
      t.is( recs[1] instanceof Record, true );
    }
  )

  test.serial(
    'allRecords() with data multiple rows',
    async t => {
      const users = await db.table('users');
      const recs  = await users.allRecords({
        animal: 'Badger'
      });
      t.is( recs.length, 2 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0] instanceof Record, true );
      t.is( recs[1].name, 'Brian Badger' );
      t.is( recs[1] instanceof Record, true );
    }
  )

  test.serial(
    'allRecords() with no spec',
    async t => {
      const users = await db.table('users');
      const recs  = await users.allRecords();
      t.is( recs.length, 4 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0].email, 'bobby@badgerpower.com' );
      t.is( recs[0].row.name, 'Bobby Badger' );
      t.is( recs[0].row.email, 'bobby@badgerpower.com' );
      t.is( recs[0] instanceof Record, true );
      t.is( recs[1].name, 'Brian Badger' );
      t.is( recs[1].email, 'brian@badgerpower.com' );
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
      t.is( recs.length, 4 );
      t.is( recs[0].name, 'Bobby Badger' );
      t.is( recs[0].email, 'bobby@badgerpower.com' );
      t.is( recs[0].row.name, 'Bobby Badger' );
      t.is( recs[0].row.email, 'bobby@badgerpower.com' );
      t.is( recs[0] instanceof Record, true );
      t.is( recs[1].name, 'Brian Badger' );
      t.is( recs[1].email, 'brian@badgerpower.com' );
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
      t.is( bobby.id, 1 );
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, undefined );
      t.is( bobby.row.id, 1 );
      t.is( bobby.row.name, 'Bobby Badger' );
      t.is( bobby.row.email, undefined );
      t.is( bobby instanceof Record, true );
    }
  )

  test.serial(
    'oneRecord() with then',
    async t => {
      await db.table('users')
        .then(
          users => users.oneRecord({ email: 'bobby@badgerpower.com' })
        )
        .then(
          bobby => {
            t.is( bobby.id, 1 );
            t.is( bobby.name, 'Bobby Badger' );
            t.is( bobby.email, 'bobby@badgerpower.com' );
            t.is( bobby.row.id, 1 );
            t.is( bobby.row.name, 'Bobby Badger' );
            t.is( bobby.row.email, 'bobby@badgerpower.com' );
            t.is( bobby instanceof Record, true );
          }
        )
    }
  )

  // record update
  test.serial(
    'record update',
    async t => {
      const users = await db.table('users');
      const bobby = await users.oneRecord({
        email: 'bobby@badgerpower.com'
      });
      await bobby.update({ name: 'Roberto Badger' });
      t.is( bobby.name, 'Roberto Badger' );
    }
  )

  // record delete
  test.serial(
    'record delete',
    async t => {
      const users = await db.table('users');
      const bobby = await users.oneRecord({
        email: 'bobby@badgerpower.com'
      });
      await bobby.delete();
      t.true( bobby.deleted );
      const reload = await users.anyRecord({
        email: 'bobby@badgerpower.com'
      });
      t.is( reload, undefined );
    }
  )

  test.serial(
    'cannot update deleted record',
    async t => {
      const users = await db.table('users');
      const brian = await users.oneRecord({
        email: 'brian@badgerpower.com'
      });
      await brian.delete();
      t.true( brian.deleted );

      const error = await t.throwsAsync(
        () => brian.update({ name: 'Brian the Badger' })
      );
      t.true( error instanceof DeletedRecordError );
      t.is( error.message, `Cannot update deleted users record #${brian.id}` );

      const delerror = await t.throwsAsync(
        () => brian.delete()
      );
      t.true( delerror instanceof DeletedRecordError );
      t.is( delerror.message, `Cannot delete deleted users record #${brian.id}` );
    }
  )

  test.serial(
    'insert a record',
    async t => {
      const users = await db.table('users');
      const bobby = await users.insert(
        {
          name:  'Bobby Badger',
          email: 'bobby@badgerpower.com'
        },
        { record: true }
      );
      t.is( bobby.name, 'Bobby Badger' );
      t.is( bobby.email, 'bobby@badgerpower.com' );
      t.is( bobby instanceof Record, true );
    }
  )

  test.serial(
    'insert a record with reload',
    async t => {
      const users = await db.table('users');
      const brian = await users.insert(
        {
          name:  'Brian Badger',
          email: 'brian@badgerpower.com'
        },
        { record: true, reload: true }
      );
      t.is( brian.name, 'Brian Badger' );
      t.is( brian.email, 'brian@badgerpower.com' );
      t.is( brian instanceof Record, true );
    }
  )

  test.serial(
    'insert records',
    async t => {
      const users = await db.table('users');
      const records = await users.insertRecords(
        [
          {
            name:  'Frank Ferret',
            email: 'frank@badgerpower.com'
          },
          {
            name:  'Simon Stoat',
            email: 'simon@badgerpower.com'
          },
        ],
        // { record: true, reload: true }
      );
      t.is( records.length, 2 );
      t.is( records[0].name, 'Frank Ferret' );
      t.is( records[0].email, 'frank@badgerpower.com' );
      t.is( records[0] instanceof Record, true );
      t.is( records[1].name, 'Simon Stoat' );
      t.is( records[1].email, 'simon@badgerpower.com' );
      t.is( records[1] instanceof Record, true );
    }
  )

  test.after(
    () => db.disconnect()
  )
}