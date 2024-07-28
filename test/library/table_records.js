import { expect, test } from 'vitest'
import Record from '../../src/Record.js'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { createUsersTableQuery } from './users_table.js'
import { ColumnValidationError, DeletedRecordError } from '../../src/Utils/Error.js'
import { expectToThrowAsyncErrorTypeMessage, pass } from './expect.js'

export function runTableRecordsTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test( 'connect',
    () => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required animal',
            queries: {
              byName:  table => table.select().where('name'),
              badgers: table => table.select().where({ animal: 'Badger' })
            },
            debug: false
          }
        }
      })
      pass()
    }
  )

  test( 'drop table',
    async () => {
      await db.run(
        `DROP TABLE IF EXISTS users`
      )
      pass()
    }
  )

  test( 'create table',
    async () => {
      await db.run(create)
      pass()
    }
  );

  test( 'insert a row',
    async () => {
      const users = await db.table('users')
      const result = await users.insert(
        {
          name:  'Bobby Badger',
          email: 'bobby@badgerpower.com',
          animal: 'Badger',
        },
        { reload: true }
      )
      expect(result.id).toBe(1)
      expect(result.name).toBe('Bobby Badger')
      expect(result.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'insert another row',
    async () => {
      const users = await db.table('users')
      const result = await users.insert(
        {
          name:   'Brian Badger',
          email:  'brian@badgerpower.com',
          animal: 'Badger',
        },
        { reload: true }
      )
      expect(result.id).toBe(2)
      expect(result.name).toBe('Brian Badger')
      expect(result.email).toBe('brian@badgerpower.com')
    }
  )

  test( 'insert multiple rows',
    async () => {
      const users = await db.table('users')
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
      ])
      expect(result.length).toBe(2)
    }
  )

  // one methods
  test( 'fetchOneRecord()',
    async () => {
      const users = await db.table('users')
      const bobby = await users.fetchOneRecord({
        email: 'bobby@badgerpower.com'
      })
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.row.name).toBe('Bobby Badger')
      expect(bobby.row.email).toBe('bobby@badgerpower.com')
      expect(bobby).toBeInstanceOf(Record)
    }
  )
  test( 'fetchRecord()',
    async () => {
      const users = await db.table('users');
      const bobby = await users.fetchRecord({
        email: 'bobby@badgerpower.com'
      })
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.row.name).toBe('Bobby Badger')
      expect(bobby.row.email).toBe('bobby@badgerpower.com')
      expect(bobby).toBeInstanceOf(Record)
    }
  )
  test( 'one()',
    async () => {
      const users = await db.table('users')
      const bobby = await users.one(
        'byName', ['Bobby Badger']
      )
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.row).toBe(undefined)
    }
  )
  test( 'one() with record option',
    async () => {
      const users = await db.table('users')
      const bobby = await users.one(
        'byName', ['Bobby Badger'], { record: true }
      )
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.row.name).toBe('Bobby Badger')
      expect(bobby.row.email).toBe('bobby@badgerpower.com')
      expect(bobby).toBeInstanceOf(Record)
    }
  )
  test( 'oneRecord() with data',
    async () => {
      const users = await db.table('users')
      const bobby = await users.oneRecord({
        email: 'bobby@badgerpower.com'
      })
      // console.log('oneRecord() returned: ', bobby);
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.row.name).toBe('Bobby Badger')
      expect(bobby.row.email).toBe('bobby@badgerpower.com')
      expect(bobby).toBeInstanceOf(Record)
    }
  )
  test( 'oneRecord() with query',
    async () => {
      const users = await db.table('users')
      const bobby = await users.oneRecord(
        'byName', ['Bobby Badger']
      )
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.row.name).toBe('Bobby Badger')
      expect(bobby.row.email).toBe('bobby@badgerpower.com')
      expect(bobby).toBeInstanceOf(Record)
    }
  )
  test( 'oneRecord() with columns',
    async () => {
      const users = await db.table('users')
      const bobby = await users.oneRecord(
        {
          email: 'bobby@badgerpower.com'
        },
        {
          columns: 'id name'
        }
      )
      expect(bobby.id).toBe(1)
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe(undefined)
      expect(bobby.row.id).toBe(1)
      expect(bobby.row.name).toBe('Bobby Badger')
      expect(bobby.row.email).toBe(undefined)
      expect(bobby).toBeInstanceOf(Record)
    }
  )
  test( 'oneRecord() with then',
    async () => {
      await db.table('users')
        .then(
          users => users.oneRecord({ email: 'bobby@badgerpower.com' })
        )
        .then(
          bobby => {
            expect(bobby.id).toBe(1)
            expect(bobby.name).toBe('Bobby Badger')
            expect(bobby.email).toBe('bobby@badgerpower.com')
            expect(bobby.row.id).toBe(1)
            expect(bobby.row.name).toBe('Bobby Badger')
            expect(bobby.row.email).toBe('bobby@badgerpower.com')
            expect(bobby).toBeInstanceOf(Record)
          }
        )
    }
  )

  // any
  test( 'fetchAnyRecord()',
    async () => {
      const users = await db.table('users');
      const bobby = await users.fetchAnyRecord({
        email: 'bobby@badgerpower.com'
      })
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.row.name).toBe('Bobby Badger')
      expect(bobby.row.email).toBe('bobby@badgerpower.com')
      expect(bobby).toBeInstanceOf(Record)
    }
  )
  test( 'any() with record option',
    async () => {
      const users = await db.table('users')
      const bobby = await users.any(
        'byName', ['Bobby Badger'], { record: true }
      )
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.row.name).toBe('Bobby Badger')
      expect(bobby.row.email).toBe('bobby@badgerpower.com')
      expect(bobby).toBeInstanceOf(Record)
    }
  )
  test( 'anyRecord() with data',
    async () => {
      const users = await db.table('users')
      const bobby = await users.anyRecord({
        email: 'bobby@badgerpower.com'
      })
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.row.name).toBe('Bobby Badger')
      expect(bobby.row.email).toBe('bobby@badgerpower.com')
      expect(bobby).toBeInstanceOf(Record)
    }
  )
  test( 'anyRecord() with query',
    async () => {
      const users = await db.table('users')
      const bobby = await users.anyRecord(
        'byName', ['Bobby Badger']
      )
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby.row.name).toBe('Bobby Badger')
      expect(bobby.row.email).toBe('bobby@badgerpower.com')
      expect(bobby).toBeInstanceOf(Record)
    }
  )

  // all
  test( 'fetchAllRecords()',
    async () => {
      const users = await db.table('users')
      const recs  = await users.fetchAllRecords({
        email: 'bobby@badgerpower.com'
      })
      expect(recs.length).toBe(1)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0].email).toBe('bobby@badgerpower.com')
      expect(recs[0].row.name).toBe('Bobby Badger')
      expect(recs[0].row.email).toBe('bobby@badgerpower.com')
      expect(recs[0]).toBeInstanceOf(Record)
    }
  )
  test( 'fetchRecords()',
    async () => {
      const users = await db.table('users')
      const recs  = await users.fetchRecords({
        email: 'bobby@badgerpower.com'
      })
      expect(recs.length).toBe(1)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0].email).toBe('bobby@badgerpower.com')
      expect(recs[0].row.name).toBe('Bobby Badger')
      expect(recs[0].row.email).toBe('bobby@badgerpower.com')
      expect(recs[0]).toBeInstanceOf(Record)
    }
  )
  test( 'all()',
    async () => {
      const users = await db.table('users')
      const rows  = await users.all(
        'byName', ['Bobby Badger']
      )
      expect(rows.length).toBe(1)
      expect(rows[0].name).toBe('Bobby Badger')
      expect(rows[0].email).toBe('bobby@badgerpower.com')
      expect(rows[0].row).toBe(undefined)
    }
  )
  test( 'all() with record option',
    async () => {
      const users = await db.table('users')
      const recs  = await users.all(
        'byName', ['Bobby Badger'], { record: true }
      )
      expect(recs.length).toBe(1)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0].email).toBe('bobby@badgerpower.com')
      expect(recs[0].row.name).toBe('Bobby Badger')
      expect(recs[0].row.email).toBe('bobby@badgerpower.com')
      expect(recs[0]).toBeInstanceOf(Record)
    }
  )
  test( 'allRecords() with data',
    async () => {
      const users = await db.table('users')
      const recs  = await users.allRecords({
        email: 'bobby@badgerpower.com'
      })
      expect(recs.length).toBe(1)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0].email).toBe('bobby@badgerpower.com')
      expect(recs[0].row.name).toBe('Bobby Badger')
      expect(recs[0].row.email).toBe('bobby@badgerpower.com')
      expect(recs[0]).toBeInstanceOf(Record)
    }
  )
  test( 'allRecords() with query',
    async () => {
      const users = await db.table('users')
      const recs  = await users.allRecords(
        'byName', ['Bobby Badger']
      )
      expect(recs.length).toBe(1)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0].email).toBe('bobby@badgerpower.com')
      expect(recs[0].row.name).toBe('Bobby Badger')
      expect(recs[0].row.email).toBe('bobby@badgerpower.com')
      expect(recs[0]).toBeInstanceOf(Record)
    }
  )
  test( 'fetchAllRecords() multiple rows',
    async () => {
      const users = await db.table('users')
      const recs  = await users.fetchAllRecords({
        animal: 'Badger'
      })
      expect(recs.length).toBe(2)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0]).toBeInstanceOf(Record)
      expect(recs[1].name).toBe('Brian Badger')
      expect(recs[1]).toBeInstanceOf(Record)
    }
  )
  test( 'fetchRecords() multiple rows',
    async () => {
      const users = await db.table('users')
      const recs  = await users.fetchRecords({
        animal: 'Badger'
      })
      expect(recs.length).toBe(2)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0]).toBeInstanceOf(Record)
      expect(recs[1].name).toBe('Brian Badger')
      expect(recs[1]).toBeInstanceOf(Record)
    }
  )
  test( 'allRecords() multiple rows',
    async () => {
      const users = await db.table('users')
      const recs  = await users.allRecords('badgers')
      expect(recs.length).toBe(2)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0]).toBeInstanceOf(Record)
      expect(recs[1].name).toBe('Brian Badger')
      expect(recs[1]).toBeInstanceOf(Record)
    }
  )
  test( 'all() with record option multiple rows',
    async () => {
      const users = await db.table('users')
      const recs  = await users.all('badgers', [], { record: true })
      expect(recs.length).toBe(2)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0]).toBeInstanceOf(Record)
      expect(recs[1].name).toBe('Brian Badger')
      expect(recs[1]).toBeInstanceOf(Record)
    }
  )
  test( 'allRecords() with query multiple rows',
    async () => {
      const users = await db.table('users')
      const recs  = await users.allRecords('badgers')
      expect(recs.length).toBe(2)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0]).toBeInstanceOf(Record)
      expect(recs[1].name).toBe('Brian Badger')
      expect(recs[1]).toBeInstanceOf(Record)
    }
  )
  test( 'allRecords() with query multiple rows repeated',
    async () => {
      const users = await db.table('users')
      const recs  = await users.allRecords('badgers')
      expect(recs.length).toBe(2)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0]).toBeInstanceOf(Record)
      expect(recs[1].name).toBe('Brian Badger')
      expect(recs[1]).toBeInstanceOf(Record)
    }
  )
  test( 'allRecords() with data multiple rows',
    async () => {
      const users = await db.table('users')
      const recs  = await users.allRecords({
        animal: 'Badger'
      })
      expect(recs.length).toBe(2)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0]).toBeInstanceOf(Record)
      expect(recs[1].name).toBe('Brian Badger')
      expect(recs[1]).toBeInstanceOf(Record)
    }
  )
  test( 'allRecords() with no spec',
    async () => {
      const users = await db.table('users')
      const recs  = await users.allRecords()
      expect(recs.length).toBe(4)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0].email).toBe('bobby@badgerpower.com')
      expect(recs[0].row.name).toBe('Bobby Badger')
      expect(recs[0].row.email).toBe('bobby@badgerpower.com')
      expect(recs[0]).toBeInstanceOf(Record)
      expect(recs[1].name).toBe('Brian Badger')
      expect(recs[1].email).toBe('brian@badgerpower.com')
      expect(recs[1].row.name).toBe('Brian Badger')
      expect(recs[1].row.email).toBe('brian@badgerpower.com')
      expect(recs[1]).toBeInstanceOf(Record)
    }
  )
  test( 'allRecords() with empty spec',
    async () => {
      const users = await db.table('users')
      const recs  = await users.allRecords({ })
      expect(recs.length).toBe(4)
      expect(recs[0].name).toBe('Bobby Badger')
      expect(recs[0].email).toBe('bobby@badgerpower.com')
      expect(recs[0].row.name).toBe('Bobby Badger')
      expect(recs[0].row.email).toBe('bobby@badgerpower.com')
      expect(recs[0]).toBeInstanceOf(Record)
      expect(recs[1].name).toBe('Brian Badger')
      expect(recs[1].email).toBe('brian@badgerpower.com')
      expect(recs[1].row.name).toBe('Brian Badger')
      expect(recs[1].row.email).toBe('brian@badgerpower.com')
      expect(recs[1]).toBeInstanceOf(Record)
    }
  )

  // record update
  test( 'record update',
    async () => {
      const users = await db.table('users')
      const bobby = await users.oneRecord({
        email: 'bobby@badgerpower.com'
      })
      await bobby.update({ name: 'Roberto Badger' })
      expect(bobby.name).toBe('Roberto Badger')
    }
  )
  test( 'record update with extra parameters throws error',
    async () => {
      const users = await db.table('users');
      const bobby = await users.oneRecord({
        email: 'bobby@badgerpower.com'
      });
      expectToThrowAsyncErrorTypeMessage(
        () => bobby.update({
          name: 'Rob Badger',
          something_else: 'This should be ignored'
        }),
        ColumnValidationError,
        'Unknown "something_else" column in the users table'
      )
    }
  )
  test( 'record update with extra parameters and pick option',
    async () => {
      const users = await db.table('users')
      const bobby = await users.oneRecord({
        email: 'bobby@badgerpower.com'
      })
      await bobby.update(
        {
          name: 'Rob Badger',
          something_else: 'This should be ignored'
        },
        { pick: true }
      );
      expect(bobby.name).toBe('Rob Badger')
    }
  )

  // record delete
  test( 'record delete',
    async () => {
      const users = await db.table('users')
      const bobby = await users.oneRecord({
        email: 'bobby@badgerpower.com'
      })
      await bobby.delete()
      expect(bobby.deleted).toBe(true)
      const reload = await users.anyRecord({
        email: 'bobby@badgerpower.com'
      })
      expect(reload).toBe(undefined)
    }
  )
  test( 'cannot update deleted record',
    async () => {
      const users = await db.table('users')
      const brian = await users.oneRecord({
        email: 'brian@badgerpower.com'
      })
      await brian.delete()
      expect(brian.deleted).toBe(true)

      expectToThrowAsyncErrorTypeMessage(
        () => brian.update({ name: 'Brian the Badger' }),
        DeletedRecordError,
        `Cannot update deleted users record #${brian.id}`
      )
      expectToThrowAsyncErrorTypeMessage(
        () => brian.delete(),
        DeletedRecordError,
        `Cannot delete deleted users record #${brian.id}`
      )
    }
  )

  // insert records
  test( 'insert a record',
    async () => {
      const users = await db.table('users')
      const bobby = await users.insert(
        {
          name:  'Bobby Badger',
          email: 'bobby@badgerpower.com'
        },
        { record: true }
      )
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
      expect(bobby).toBeInstanceOf(Record)
    }
  )
  test( 'insert a record with reload',
    async () => {
      const users = await db.table('users')
      const brian = await users.insert(
        {
          name:  'Brian Badger',
          email: 'brian@badgerpower.com'
        },
        { record: true, reload: true }
      )
      expect(brian.name).toBe('Brian Badger')
      expect(brian.email).toBe('brian@badgerpower.com')
      expect(brian).toBeInstanceOf(Record)
    }
  )
  test( 'insert a record using insertRecord()',
    async () => {
      const users = await db.table('users')
      const alan  = await users.insertRecord(
        {
          name:  'Alan Aardvark',
          email: 'alan@badgerpower.com'
        },
      )
      expect(alan.name).toBe('Alan Aardvark')
      expect(alan.email).toBe('alan@badgerpower.com')
      expect(alan).toBeInstanceOf(Record)
    }
  )
  test( 'insert records using insertRecords()',
    async () => {
      const users = await db.table('users')
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
      )
      expect(records.length).toBe(2)
      expect(records[0].name).toBe('Frank Ferret')
      expect(records[0].email).toBe('frank@badgerpower.com')
      expect(records[0]).toBeInstanceOf(Record)
      expect(records[1].name).toBe('Simon Stoat')
      expect(records[1].email).toBe('simon@badgerpower.com')
      expect(records[1]).toBeInstanceOf(Record)
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}