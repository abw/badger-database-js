import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { ColumnValidationError } from '../../src/Utils/Error.js'
import { expectToThrowAsyncErrorTypeMessage } from '../library/expect.js'

test( 'users table with string of columns',
  async () => {
    const db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          columns: 'id name email'
        },
      }
    })
    const users = await db.table('users');
    expect(
      Object.keys(users.columns)
    ).toStrictEqual(
      ['id', 'name', 'email']
    )
    expect(users.columns.id.column).toBe('id')
    expect(users.columns.id.tableColumn).toBe('users.id')
    expect(users.columns.name.column).toBe('name')
    expect(users.columns.name.tableColumn).toBe('users.name')
    expect(users.columns.email.column).toBe('email')
    expect(users.columns.email.tableColumn).toBe('users.email')
    db.disconnect()
  }
)

test( 'users table with some required columns',
  async () => {
    const db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          columns: 'id:readonly name:required email:required'
        },
      }
    })
    const users = await db.table('users');
    expect(
      Object.keys(users.columns)
    ).toStrictEqual(
      ['id', 'name', 'email']
    )
    expect(
      users.readonly
    ).toStrictEqual(
      ['id']
    )
    expect(
      users.required
    ).toStrictEqual(
      ['name', 'email']
    )
    db.disconnect()
  }
)

test( 'users table with custom id',
  async () => {
    const db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          id: 'user_id',
          columns: 'user_id:readonly name:required email:required'
        },
      }
    })
    const users = await db.table('users');
    expect(
      Object.keys(users.columns)
    ).toStrictEqual(
      ['user_id', 'name', 'email']
    )
    expect(
      users.readonly
    ).toStrictEqual(
      ['user_id']
    )
    expect(
      users.required
    ).toStrictEqual(
      ['name', 'email']
    )
    expect(users.id).toBe('user_id')
    db.disconnect()
  }
)

test( 'users table with custom id marked in columns',
  async () => {
    const db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          columns: 'user_id:id:readonly name:required email:required'
        },
      }
    })
    const users = await db.table('users');
    expect(
      Object.keys(users.columns)
    ).toStrictEqual(
      ['user_id', 'name', 'email']
    )
    expect(
      users.readonly
    ).toStrictEqual(
      ['user_id']
    )
    expect(
      users.required
    ).toStrictEqual(
      ['name', 'email']
    )
    expect(users.id).toBe('user_id')
    db.disconnect();
  }
)

test( 'users table with multiple id columns marked',
  () => expectToThrowAsyncErrorTypeMessage(
    async () => {
      const db = connect({
        database: 'sqlite:memory',
        tables: {
          users: {
            columns: 'user_id:id another_id:id name:required email:required'
          },
        }
      })
      await db.table('users')
    },
    ColumnValidationError,
    'Multiple columns are marked as "id" in the users table'
  )
)

test( 'users table with custom keys',
  async () => {
    const db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          keys: 'user_id another_id',
          columns: 'user_id:readonly another_id:readonly name:required email:required'
        },
      }
    })
    const users = await db.table('users');
    expect(
      Object.keys(users.columns),
    ).toStrictEqual(
      ['user_id', 'another_id', 'name', 'email']
    )
    expect(
      users.readonly,
    ).toStrictEqual(
      ['user_id', 'another_id']
    )
    expect(
      users.required,
    ).toStrictEqual(
      ['name', 'email']
    )
    expect(
      users.keys,
    ).toStrictEqual(
      ['user_id', 'another_id']
    )
    expect(users.id).toBeUndefined()
    db.disconnect();
  }
)

test( 'users table with custom keys marked in columns',
  async () => {
    const db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          columns: 'user_id:readonly:key another_id:readonly:key name:required email:required'
        },
      }
    })
    const users = await db.table('users');
    expect(
      Object.keys(users.columns),
    ).toStrictEqual(
      ['user_id', 'another_id', 'name', 'email']
    )
    expect(
      users.readonly,
    ).toStrictEqual(
      ['user_id', 'another_id']
    )
    expect(
      users.required,
    ).toStrictEqual(
      ['name', 'email']
    )
    expect(
      users.keys,
    ).toStrictEqual(
      ['user_id', 'another_id']
    )
    expect(users.id).toBeUndefined()
    db.disconnect();
  }
)

test( 'users table with expanded columns',
  async () => {
    const db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          columns: {
            user_id: "readonly:key",
            another_id: {
              readonly: true,
              key: true
            },
            name: "required",
            email: {
              required: true
            },
            optional: '',
          }
        },
      }
    })
    const users = await db.table('users');
    expect(
      Object.keys(users.columns),
    ).toStrictEqual(
      ['user_id', 'another_id', 'name', 'email', 'optional']
    )
    expect(
      users.readonly,
    ).toStrictEqual(
      ['user_id', 'another_id']
    )
    expect(
      users.required,
    ).toStrictEqual(
      ['name', 'email']
    )
    expect(
      users.keys,
    ).toStrictEqual(
      ['user_id', 'another_id']
    )
    expect(users.id).toBeUndefined()
    db.disconnect();
  }
)
