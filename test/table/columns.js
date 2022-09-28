import test from 'ava';
import { database } from '../../src/Database.js';

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
