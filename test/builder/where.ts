import { expect, test } from 'vitest'
import Where from '../../src/Builder/Where.js'
import { connect } from '../../src/Database.js'
import { sql } from '../../src/index.js'
import { QueryBuilderError } from '../../src/Utils/Error.js'
import { expectOpTypeSql, expectToThrowErrorTypeMessage } from '../library/expect.js'
import { DatabaseInstance } from '@/src/types'

let db: DatabaseInstance

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'where',
  () => expectOpTypeSql(
    db.build.where('a'),
    Where,
    'WHERE "a" = ?'
  )
)

test( 'column',
  () => expectOpTypeSql(
    db.build.from('users').select('id name email').where('name'),
    Where,
    'SELECT "id", "name", "email"\nFROM "users"\nWHERE "name" = ?'
  )
)

test( 'columns string',
  () => expectOpTypeSql(
    db.build.from('users').select('id email').where('name email'),
    Where,
    'SELECT "id", "email"\nFROM "users"\nWHERE "name" = ? AND "email" = ?'
  )
)

test( 'array with two elements',
  () => {
    const query = db.build.from('users').select('id email').where(['name', 'Bobby Badger'])
    expect(query.sql()).toBe('SELECT "id", "email"\nFROM "users"\nWHERE "name" = ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe('Bobby Badger')
  }
)

test( 'array with three elements',
  () => {
    const query = db.build.from('users').select('id email').where(['name', '!=', 'Bobby Badger'])
    expect(query.sql()).toBe('SELECT "id", "email"\nFROM "users"\nWHERE "name" != ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe('Bobby Badger')
  }
)

test( 'array with three elements, last one undefined',
  () => {
    const query = db.build.from('users').select('id email').where(['name', '!=', undefined])
    expect(query.sql()).toBe('SELECT "id", "email"\nFROM "users"\nWHERE "name" != ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'array with two elements, second one is a comparison',
  () => {
    const query = db.build.from('users').select('id email').where(['name', ['!=']]);
    expect(query.sql()).toBe('SELECT "id", "email"\nFROM "users"\nWHERE "name" != ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'array with two elements, second one is an array of comparison and value',
  () => {
    const query = db.build.from('users').select('id email').where(['name', ['!=', 'Bobby Badger']]);
    expect(query.sql()).toBe('SELECT "id", "email"\nFROM "users"\nWHERE "name" != ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe('Bobby Badger')
  }
)

test( 'array with four elements',
  () => expectToThrowErrorTypeMessage(
    () => db.build.from('a').where(['users', 'email', 'email_address', 'oops']).sql(),
    QueryBuilderError,
    'Invalid array with 4 items specified for query builder "where" component. Expected [column, value] or [column, operator, value].'
  )
)

test( 'table name',
  () => {
    const query = db.build.from('users').select('id email').where('users.name', 'u.email')
    expect(query.sql()).toBe('SELECT "id", "email"\nFROM "users"\nWHERE "users"."name" = ? AND "u"."email" = ?')
  }
)

test( 'column with value',
  () => {
    const query = db.build.from('users').select('id email').where({ name: 'Brian Badger' })
    expect(query.sql()).toBe('SELECT "id", "email"\nFROM "users"\nWHERE "name" = ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe('Brian Badger')
  }
)

test( 'column with comparison',
  () => {
    const query = db.build.from('users').select('email').where({ id: ['>', 99] })
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" > ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe(99)
  }
)

test( 'column with comparison operator',
  () => {
    const query = db.build.from('users').select('email').where({ id: ['>'] });
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" > ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'where sql clause',
  () => {
    const query = db.build.from('users').select('email').where([sql`COUNT(product_id)`, '>', undefined]);
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE COUNT(product_id) > ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'where id in with raw sql',
  () => {
    const query = db.build.from('users').select('email').where(sql`id in (?, ?, ?)`);
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE id in (?, ?, ?)')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'where array id in three elements',
  () => {
    const query = db.build.from('users').select('email').where(['id', 'in', [123, 456, 789]]);
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" IN (?,?,?)')
    expect(query.allValues().length).toBe(3)
    expect(query.allValues().join(' ')).toBe('123 456 789')
  }
)

test( 'where array id not in three elements',
  () => {
    const query = db.build.from('users').select('email').where(['id', 'not in', [123, 456, 789]]);
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" NOT IN (?,?,?)')
    expect(query.allValues().length).toBe(3)
    expect(query.allValues().join(' ')).toBe('123 456 789')
  }
)

test( 'where array id in three elements coerce to array',
  () => {
    const query = db.build.from('users').select('email').where(['id', 'in', 123]);
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" IN (?)')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues().join(' ')).toBe('123')
  }
)

test( 'where array id in two elements',
  () => {
    const query = db.build.from('users').select('email').where(['id', ['in', [123, 456, 789]]]);
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" IN (?,?,?)')
    expect(query.allValues().length).toBe(3)
    expect(query.allValues().join(' ')).toBe('123 456 789')
  }
)

test( 'where array id not in two elements',
  () => {
    const query = db.build.from('users').select('email').where(['id', ['not in', [123, 456, 789]]]);
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" NOT IN (?,?,?)')
    expect(query.allValues().length).toBe(3)
    expect(query.allValues().join(' ')).toBe('123 456 789')
  }
)

test( 'where array id in two elements coerce to array',
  () => {
    const query = db.build.from('users').select('email').where(['id', ['in', 123]]);
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" IN (?)')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues().join(' ')).toBe('123')
  }
)

test( 'where object id in',
  () => {
    const query = db.build.from('users').select('email').where({ id: ['in', [123, 456, 789]] });
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" IN (?,?,?)')
    expect(query.allValues().length).toBe(3)
    expect(query.allValues()[0]).toBe(123)
    expect(query.allValues()[1]).toBe(456)
    expect(query.allValues()[2]).toBe(789)
  }
)

test( 'where object id not in',
  () => {
    const query = db.build.from('users').select('email').where({ id: ['not in', [123, 456, 789]] });
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" NOT IN (?,?,?)')
    expect(query.allValues().length).toBe(3)
    expect(query.allValues()[0]).toBe(123)
    expect(query.allValues()[1]).toBe(456)
    expect(query.allValues()[2]).toBe(789)
  }
)

test( 'where object id in with extra clauses',
  () => {
    const query = db.build
      .from('users')
      .select('email')
      .where({
        volume: 11,
        id: ['in', [123, 456, 789]],
        description: 'One louder'
      });
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "volume" = ? AND "id" IN (?,?,?) AND "description" = ?')
    expect(query.allValues().length).toBe(5)
    expect(query.allValues()[0]).toBe(11)
    expect(query.allValues()[1]).toBe(123)
    expect(query.allValues()[2]).toBe(456)
    expect(query.allValues()[3]).toBe(789)
    expect(query.allValues()[4]).toBe('One louder')
  }
)


test( 'where null clause',
  () => {
    const query = db.build.from('users').select('id').where({ deleted: null });
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "deleted" is NULL')
  }
)

test( 'object with value array with three elements',
  () => expectToThrowErrorTypeMessage(
    () => db.build.from('a').where({ id: ['id', '>', 123] }).sql(),
    QueryBuilderError,
    'Invalid value array with 3 items specified for query builder "where" component. Expected [value] or [operator, value].'
  )
)

test( 'generateSQL() with single value',
  () => expect(
    Where.generateSQL('a')
  ).toBe(
    'WHERE a'
  )
)

test( 'generateSQL() with multiple values',
  () => expect(
    Where.generateSQL(['a', 'b'])
  ).toBe(
    'WHERE a AND b'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
