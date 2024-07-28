import { expect, test } from 'vitest'
import Delete from '../../src/Builder/Delete.js'
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js'
import { sql } from '../../src/Utils/Tags.js'
import { expectOpTypeSql, expectToThrowErrorTypeMessage } from '../library/expect.js'

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' });
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'delete',
  () => expectOpTypeSql(
    db.build.delete(),
    Delete,
    'DELETE'
  )
)

test( 'delete a',
  () => expectOpTypeSql(
    db.build.delete('a'),
    Delete,
    'DELETE "a"'
  )
)

test( 'delete a.*',
  () => expectOpTypeSql(
    db.build.delete('a.*'),
    Delete,
    'DELETE "a".*'
  )
)

test( 'delete from',
  () => expect(
    db.build.delete().from('foo').sql()
  ).toBe(
    'DELETE\nFROM "foo"'
  )
)

test( 'delete from where',
  () => expect(
    db.build.delete().from('foo').where('x').sql()
  ).toBe(
    'DELETE\nFROM "foo"\nWHERE "x" = ?'
  )
)

test( 'delete from where=10',
  () => {
    const op = db.build.delete().from('foo').where({ x: 10 });
    expect(op.sql()).toBe('DELETE\nFROM "foo"\nWHERE "x" = ?')
    expect(op.whereValues()).toStrictEqual([10])
  }
)

test( 'delete { sql }',
  () => expect(
    db.build.delete({ sql: 'Hello World'}).sql()
  ).toBe(
    'DELETE Hello World'
  )
)

test( 'delete sql``',
  () => expect(
    db.build.delete(sql`Hello World`).sql()
  ).toBe(
    'DELETE Hello World'
  )
)

test( 'delete select error',
  () => expectToThrowErrorTypeMessage(
    () => db.build.delete().select('foo'),
    QueryBuilderError,
    "select() is not a valid builder method for a DELETE query."
  )
)

test( 'disconnect',
  () => db.disconnect()
)
