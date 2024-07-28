import { expect, test } from 'vitest'
import { prepareColumns } from '../../src/Utils/Columns.js'
import { ColumnValidationError } from '../../src/Utils/Error.js'

test( 'string of columns',
  () => {
    const columns = prepareColumns(
      { columns: 'id name email', table: 'users' }
    );
    expect(Object.keys(columns)).toStrictEqual(['id', 'name', 'email'])
    expect(columns.id.column).toBe('id');
    expect(columns.id.tableColumn).toBe('users.id');
    expect(columns.name.column).toBe('name');
    expect(columns.name.tableColumn).toBe('users.name');
    expect(columns.email.column).toBe('email');
    expect(columns.email.tableColumn).toBe('users.email');
  }
)

test( 'array of columns',
  () => {
    const columns = prepareColumns(
      {
        table: 'users',
        columns: ['id', 'name', 'email'],
      }
    )
    expect(Object.keys(columns)).toStrictEqual(['id', 'name', 'email'])
    expect(columns.id.column).toBe('id');
    expect(columns.id.tableColumn).toBe('users.id');
    expect(columns.name.column).toBe('name');
    expect(columns.name.tableColumn).toBe('users.name');
    expect(columns.email.column).toBe('email');
    expect(columns.email.tableColumn).toBe('users.email');
  }
)

test( 'hash of columns',
  () => {
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
    expect(Object.keys(columns)).toStrictEqual(['id', 'name', 'email'])
    expect(columns.id.column).toBe('user_id');
    expect(columns.id.tableColumn).toBe('users.user_id');
    expect(columns.id.readonly).toBe(true);
    expect(columns.name.column).toBe('name');
    expect(columns.name.tableColumn).toBe('users.name');
    expect(columns.email.column).toBe('email');
    expect(columns.email.tableColumn).toBe('users.email');
  }
)

test( 'users table with hash of columns to strings',
  () => {
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
    expect(Object.keys(columns)).toStrictEqual(['id', 'name', 'email'])
    expect(columns.id.column).toBe('id');
    expect(columns.id.tableColumn).toBe('users.id');
    expect(columns.id.readonly).toBe(true);
    expect(columns.name.column).toBe('name');
    expect(columns.name.tableColumn).toBe('users.name');
    expect(columns.name.type).toBe('text');
    expect(columns.name.required).toBe(true);
    expect(columns.email.column).toBe('email');
    expect(columns.email.tableColumn).toBe('users.email');
    expect(columns.email.type).toBe('text');
    expect(columns.email.required).toBe(true);
  }
)

test( 'string of columns with modifiers',
  () => {
    const columns = prepareColumns(
      {
        table: 'users',
        columns: 'id:readonly name:type=text:required',
      }
    )
    expect(Object.keys(columns)).toStrictEqual(['id', 'name'])
    expect(columns.id.column).toBe('id');
    expect(columns.id.tableColumn).toBe('users.id');
    expect(columns.id.readonly).toBe(true);
    expect(columns.name.column).toBe('name');
    expect(columns.name.tableColumn).toBe('users.name');
    expect(columns.name.type).toBe('text');
    expect(columns.name.required).toBe(true);
  }
)


test( 'no columns',
  () => {
    expect(() => prepareColumns({ table: 'users' }))
      .toThrowError('No "columns" specified for the users table')
    expect(() => prepareColumns({ table: 'users' }))
      .toThrowError(ColumnValidationError)
  }
)

test( 'invalid columns',
  () => {
    expect(() => prepareColumns({ table: 'users', columns: 99 }))
      .toThrowError('Invalid "columns" specified for the users table: 99')
    expect(() => prepareColumns({ table: 'users', columns: 99 }))
      .toThrowError(ColumnValidationError)
  }
)
