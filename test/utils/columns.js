import test from 'ava';
import { prepareColumns } from '../../src/Utils/Columns.js';

test(
  'string of columns',
  t => {
    const columns = prepareColumns(
      'id name email',
      { table: 'users' }
    );
    t.deepEqual(
      Object.keys(columns),
      ['id', 'name', 'email']
    )
    t.is(columns.id.column, 'id');
    t.is(columns.id.tableColumn, 'users.id');
    t.is(columns.name.column, 'name');
    t.is(columns.name.tableColumn, 'users.name');
    t.is(columns.email.column, 'email');
    t.is(columns.email.tableColumn, 'users.email');
  }
)

test(
  'array of columns',
  t => {
    const columns = prepareColumns(
      ['id', 'name', 'email'],
      { table: 'users' }
    )
    t.deepEqual(
      Object.keys(columns),
      ['id', 'name', 'email']
    )
    t.is(columns.id.column, 'id');
    t.is(columns.id.tableColumn, 'users.id');
    t.is(columns.name.column, 'name');
    t.is(columns.name.tableColumn, 'users.name');
    t.is(columns.email.column, 'email');
    t.is(columns.email.tableColumn, 'users.email');
  }
)

test(
  'hash of columns',
  t => {
    const columns = prepareColumns(
      {
        id:     { column: 'user_id', readonly: true },
        name:   { },
        email:  { }
      },
      { table: 'users' }
    )
    t.deepEqual(
      Object.keys(columns),
      ['id', 'name', 'email']
    )
    t.is(columns.id.column, 'user_id');
    t.is(columns.id.tableColumn, 'users.user_id');
    t.is(columns.id.readonly, true);
    t.is(columns.name.column, 'name');
    t.is(columns.name.tableColumn, 'users.name');
    t.is(columns.email.column, 'email');
    t.is(columns.email.tableColumn, 'users.email');
  }
)

test(
  'users table with hash of columns to strings',
  t => {
    const columns = prepareColumns(
      {
        id:     "readonly",
        name:   "type=text:required",
        email:  "type=text:required"
      },
      { table: 'users' }
    )
    t.deepEqual(
      Object.keys(columns),
      ['id', 'name', 'email']
    )
    t.is(columns.id.column, 'id');
    t.is(columns.id.tableColumn, 'users.id');
    t.is(columns.id.readonly, true);
    t.is(columns.name.column, 'name');
    t.is(columns.name.tableColumn, 'users.name');
    t.is(columns.name.type, 'text');
    t.is(columns.name.required, true);
    t.is(columns.email.column, 'email');
    t.is(columns.email.tableColumn, 'users.email');
    t.is(columns.email.type, 'text');
    t.is(columns.email.required, true);
  }
)

test(
  'string of columns with modifiers',
  t => {
    const columns = prepareColumns(
      'id:readonly name:type=text:required',
      { table: 'users' }
    )
    t.deepEqual(
      Object.keys(columns),
      ['id', 'name']
    )
    t.is(columns.id.column, 'id');
    t.is(columns.id.tableColumn, 'users.id');
    t.is(columns.id.readonly, true);
    t.is(columns.name.column, 'name');
    t.is(columns.name.tableColumn, 'users.name');
    t.is(columns.name.type, 'text');
    t.is(columns.name.required, true);
  }
)
