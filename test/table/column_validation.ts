import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { setDebug } from '../../src/Utils/Debug.js'
import { ColumnValidationError } from '../../src/Utils/Error.js'
import { expectToThrowAsyncErrorTypeMessage } from '../library/expect.js';
import { DatabaseInstance, TableInstance } from '@/src/types'

let db: DatabaseInstance
let users: TableInstance

setDebug({
  // table: true
})

test( 'connect',
  () => {
    db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          columns: 'id:readonly name:required email:required:fixed'
        }
      }
    })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'create',
  async () => {
    const create = await db.run(
      `CREATE TABLE users (
        id INTEGER PRIMARY KEY ASC,
        name TEXT,
        email TEXT
      )`
    );
    expect(create.changes).toBe(0)
  }
)

test( 'get users tables',
  async () => {
    users = await db.table('users')
    expect(users.table).toBe('users')
  }
)

test( 'insert a row',
  async () => {
    const result = await users.insert(
      {
        name: 'Bobby Badger',
        email: 'bobby@badgerpower.com'
      },
      { reload: true }
    )
    expect(result.id).toBe(1)
    expect(result.name).toBe('Bobby Badger')
    expect(result.email).toBe('bobby@badgerpower.com')
  }
)

test( 'insert a row with readonly column',
  () => expectToThrowAsyncErrorTypeMessage(
    () => users.insert({
      id: 12345,
      name: 'Bobby Badger',
      email: 'bobby@badgerpower.com'
    }),
    ColumnValidationError,
    'The "id" column is readonly in the users table'
  )
)

test( 'insert a row with an unknown column',
  () => expectToThrowAsyncErrorTypeMessage(
    () => users.insert({
      name: 'Bobby Badger',
      email: 'bobby@badgerpower.com',
      is_admin: true
    }),
    ColumnValidationError,
    'Unknown "is_admin" column in the users table'
  )
)

test( 'update a row with an unknown column',
  () => expectToThrowAsyncErrorTypeMessage(
    () => users.update(
      {
        name: 'Bobby Badger',
        is_admin: true
      },
      {
        email: 'bobby@badgerpower.com'
      }
    ),
    ColumnValidationError,
    'Unknown "is_admin" column in the users table'
  )
)

test( 'update a row with a fixed column',
  () => expectToThrowAsyncErrorTypeMessage(
    () => users.update(
      {
        email: 'robert@badgerpower.com',
      },
      {
        name: 'Bobby Badger'
      }
    ),
    ColumnValidationError,
    'The "email" column is fixed in the users table'
  )
)

test( 'insert a row without a required column',
  () => expectToThrowAsyncErrorTypeMessage(
    () => users.insert({
      name: 'Bobby Badger',
    }),
    ColumnValidationError,
    'Missing required column "email" for the users table'
  )
)

test( 'fetch rows with an unknown column',
  () => expectToThrowAsyncErrorTypeMessage(
    () => users.allRows(
      {
        email: 'bobby@badgerpower.com',
      },
      {
        columns: 'id name is_admin'
      }
    ),
    ColumnValidationError,
    'Unknown "is_admin" column in the users table'
  )
)

test( 'fetch a row with an unknown column in the where clause',
  () => expectToThrowAsyncErrorTypeMessage(
    () => users.oneRow({
      email_address: 'bobby@badgerpower.com',
    }),
    ColumnValidationError,
    'Unknown "email_address" column in the users table'
  )
)

test( 'fetch a row with an unknown column in the where clause and pick option',
  async () => {
    const user = await users.fetchOne(
      {
        email:    'bobby@badgerpower.com',
        is_admin: true,
      },
      { pick: true }
    )
    expect(user.name).toBe('Bobby Badger')
  }
)

test( 'insert a row with an unknown column with pick option',
  async () => {
    const user = await users.insert(
      {
        name: 'Tommy Tester',
        email: 'tommy@badgerpower.com',
        is_admin: true
      },
      { reload: true, pick: true }
    );
    expect(user.name).toBe('Tommy Tester')
    expect(user.is_admin).toBeFalsy()
  }
)

test( 'update a row with an unknown column with pick option',
  async () => {
    const user = await users.updateOne(
      {
        name: 'Tommy the Tester',
        is_admin: true
      },
      {
        email: 'tommy@badgerpower.com',
      },
      { reload: true, pick: true }
    );
    expect(user.name).toBe('Tommy the Tester')
    expect(user.is_admin).toBeFalsy()
  }
)

test( 'update a row with an unknown where column with pick option',
  async () => {
    const user = await users.updateOne(
      {
        name: 'Tommy the Tester',
      },
      {
        email: 'tommy@badgerpower.com',
        is_admin: true
      },
      { reload: true, pick: true }
    );
    expect(user.name).toBe('Tommy the Tester')
    expect(user.is_admin).toBeFalsy()
  }
)

test( 'delete a row with an unknown column',
  () => expectToThrowAsyncErrorTypeMessage(
    () => users.delete(
      {
        email: 'bobby@badgerpower.com',
        is_admin: true
      },
    ),
    ColumnValidationError,
    'Unknown "is_admin" column in the users table'
  )
)

test( 'delete a row with an unknown column and pick option',
  async () => {
    const result = await users.delete(
      {
        email: 'bobby@badgerpower.com',
        is_admin: true
      },
      { pick: true }
    )
    expect(result.changes).toBe(1)
  }
)

test( 'disconnect',
  () => db.disconnect()
)