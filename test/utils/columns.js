import test from 'ava';
import { prepareColumns } from '../../src/Utils/Columns.js';
import { ColumnValidationError } from '../../src/Utils/Error.js';

test(
  'string of columns',
  t => {
    const columns = prepareColumns(
      { columns: 'id name email', table: 'users' }
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
      {
        table: 'users',
        columns: ['id', 'name', 'email'],
      }
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
        table: 'users',
        columns: {
          id:     { column: 'user_id', readonly: true },
          name:   { },
          email:  { }
        },
      }
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
        table: 'users',
        columns: {
          id:     "readonly",
          name:   "type=text:required",
          email:  "type=text:required"
        },
      }
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
      {
        table: 'users',
        columns: 'id:readonly name:type=text:required',
      }
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

test(
  'no columns',
  t => {
    const error = t.throws(
      () => prepareColumns({ table: 'users' })
    );
    t.is(error instanceof ColumnValidationError, true);
    t.is(error.message, 'No "columns" specified for the users table');
  }
)
test(
  'invalid columns',
  t => {
    const error = t.throws(
      () => prepareColumns({ table: 'users', columns: 99 })
    );
    t.is(error instanceof ColumnValidationError, true);
    t.is(error.message, 'Invalid "columns" specified for the users table: 99');
  }
)
