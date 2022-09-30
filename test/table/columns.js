import test from 'ava';
import { database } from '../../src/Database.js';
import { ColumnValidationError } from '../../src/Utils/Error.js';

test(
  'users table with string of columns',
  async t => {
    const db = await database({
      engine: 'sqlite:memory',
      tables: {
        users: {
          columns: 'id name email'
        },
      }
    })
    const users = await db.table('users');
    t.deepEqual(
      Object.keys(users.columns),
      ['id', 'name', 'email']
    )
    t.is(users.columns.id.column, 'id');
    t.is(users.columns.id.tableColumn, 'users.id');
    t.is(users.columns.name.column, 'name');
    t.is(users.columns.name.tableColumn, 'users.name');
    t.is(users.columns.email.column, 'email');
    t.is(users.columns.email.tableColumn, 'users.email');
    await db.destroy();
  }
)

test(
  'users table with some required columns',
  async t => {
    const db = await database({
      engine: 'sqlite:memory',
      tables: {
        users: {
          columns: 'id:readonly name:required email:required'
        },
      }
    })
    const users = await db.table('users');
    t.deepEqual(
      Object.keys(users.columns),
      ['id', 'name', 'email']
    )
    t.deepEqual(
      users.readonly,
      ['id']
    )
    t.deepEqual(
      users.required,
      ['name', 'email']
    )
    await db.destroy();
  }
)

test(
  'users table with custom id',
  async t => {
    const db = await database({
      engine: 'sqlite:memory',
      tables: {
        users: {
          id: 'user_id',
          columns: 'user_id:readonly name:required email:required'
        },
      }
    })
    const users = await db.table('users');
    t.deepEqual(
      Object.keys(users.columns),
      ['user_id', 'name', 'email']
    )
    t.deepEqual(
      users.readonly,
      ['user_id']
    )
    t.deepEqual(
      users.required,
      ['name', 'email']
    )
    t.is(
      users.id, 'user_id'
    )
    await db.destroy();
  }
)

test(
  'users table with custom id marked in columns',
  async t => {
    const db = await database({
      engine: 'sqlite:memory',
      tables: {
        users: {
          columns: 'user_id:id:readonly name:required email:required'
        },
      }
    })
    const users = await db.table('users');
    t.deepEqual(
      Object.keys(users.columns),
      ['user_id', 'name', 'email']
    )
    t.deepEqual(
      users.readonly,
      ['user_id']
    )
    t.deepEqual(
      users.required,
      ['name', 'email']
    )
    t.is(
      users.id, 'user_id'
    )
    await db.destroy();
  }
)

test(
  'users table with multiple id columns marked',
  async t => {
    const db = await database({
      engine: 'sqlite:memory',
      tables: {
        users: {
          columns: 'user_id:id another_id:id name:required email:required'
        },
      }
    })
    const error = await t.throwsAsync(
      () => db.table('users')
    );
    t.is( error instanceof ColumnValidationError, true );
    t.is( error.message, 'Multiple columns are marked as "id" in the users table' )
  }
)

test(
  'users table with custom keys',
  async t => {
    const db = await database({
      engine: 'sqlite:memory',
      tables: {
        users: {
          keys: 'user_id another_id',
          columns: 'user_id:readonly another_id:readonly name:required email:required'
        },
      }
    })
    const users = await db.table('users');
    t.deepEqual(
      Object.keys(users.columns),
      ['user_id', 'another_id', 'name', 'email']
    )
    t.deepEqual(
      users.readonly,
      ['user_id', 'another_id']
    )
    t.deepEqual(
      users.required,
      ['name', 'email']
    )
    t.deepEqual(
      users.keys,
      ['user_id', 'another_id']
    )
    t.is(
      users.id, undefined
    )
    await db.destroy();
  }
)

test(
  'users table with custom keys marked in columns',
  async t => {
    const db = await database({
      engine: 'sqlite:memory',
      tables: {
        users: {
          columns: 'user_id:readonly:key another_id:readonly:key name:required email:required'
        },
      }
    })
    const users = await db.table('users');
    t.deepEqual(
      Object.keys(users.columns),
      ['user_id', 'another_id', 'name', 'email']
    )
    t.deepEqual(
      users.readonly,
      ['user_id', 'another_id']
    )
    t.deepEqual(
      users.required,
      ['name', 'email']
    )
    t.deepEqual(
      users.keys,
      ['user_id', 'another_id']
    )
    t.is(
      users.id, undefined
    )
    await db.destroy();
  }
)

test(
  'users table with expanded columns',
  async t => {
    const db = await database({
      engine: 'sqlite:memory',
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
    t.deepEqual(
      Object.keys(users.columns),
      ['user_id', 'another_id', 'name', 'email', 'optional']
    )
    t.deepEqual(
      users.readonly,
      ['user_id', 'another_id']
    )
    t.deepEqual(
      users.required,
      ['name', 'email']
    )
    t.deepEqual(
      users.keys,
      ['user_id', 'another_id']
    )
    t.is(
      users.id, undefined
    )
    await db.destroy();
  }
)
