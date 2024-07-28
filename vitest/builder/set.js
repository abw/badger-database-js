import { expect, test } from 'vitest'
import Set from '../../src/Builder/Set.js'
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js'
import { sql } from '../../src/Utils/Tags.js'
import { expectOpTypeSql, expectToThrowErrorTypeMessage } from '../library/expect.js'

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'set',
  () => expectOpTypeSql(
    db.build.set('a'),
    Set,
    'SET "a" = ?'
  )
)

test( 'set string',
  () => expectOpTypeSql(
    db.build.set('a, b c'),
    Set,
    'SET "a" = ?, "b" = ?, "c" = ?'
  )
)


test( 'columns string',
  () => {
    const query = db.build.update('users').set('id name email').where('name');
    expect(
      query.sql()
    ).toBe(
      'UPDATE "users"\nSET "id" = ?, "name" = ?, "email" = ?\nWHERE "name" = ?'
    )
  }
)

test( 'array with two elements',
  () => {
    const query = db.build.update('users').set(['name', 'Bobby Badger']);
    expect(query.sql()).toBe('UPDATE "users"\nSET "name" = ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe('Bobby Badger')
  }
)

test( 'array with three elements',
  () => expectToThrowErrorTypeMessage(
    () => db.build.update('users').set(['name', '!=', 'Bobby Badger']).sql(),
    QueryBuilderError,
    'Invalid array with 3 items specified for query builder "set" component. Expected [column, value].'
  )
)

test( 'table name',
  () => expect(
    db.build.update('users').set('users.name', 'u.email').sql()
  ).toBe(
    'UPDATE "users"\nSET "users"."name" = ?, "u"."email" = ?'
  )
)

test( 'column with value',
  () => {
    const query = db.build.update('users').set({ name: 'Brian Badger' });
    expect(query.sql()).toBe('UPDATE "users"\nSET "name" = ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe('Brian Badger')
  }
)

test( 'set sql clause',
  () => {
    const query = db.build.update('users').set(sql`x = foo`);
    expect(query.sql()).toBe('UPDATE "users"\nSET x = foo')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'generateSQL() with single value',
  () => expect(
    Set.generateSQL('a = ?'),
  ).toBe(
    'SET a = ?'
  )
)

test( 'generateSQL() with multiple values',
  () => expect(
    Set.generateSQL(['a = ?', 'b = ?']),
  ).toBe(
    'SET a = ?, b = ?'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
