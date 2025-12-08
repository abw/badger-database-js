import { expect, test } from 'vitest'
import Where from '../../src/Builder/Where.js'
import { connect } from '../../src/Database.js'
import { sql } from '../../src/index.js'
import { QueryBuilderError } from '../../src/Utils/Error.js'
import { expectOpTypeSql, expectToThrowErrorTypeMessage } from '../library/expect.js'
import { lt, le, gt, ge, eq, ne, isIn, notIn, isNull, notNull } from '../../src/Comparators.js'

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

//--------------------------------------------------------------------------
// array: [column, comparator()]
//--------------------------------------------------------------------------
test( 'eq with value',
  () => {
    const query = db.build.from('users').select('id email').where(['name', eq('Bobby Badger')])
    expect(query.sql()).toBe('SELECT "id", "email"\nFROM "users"\nWHERE "name" = ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe('Bobby Badger')
  }
)

test( 'eq with no value',
  () => {
    const query = db.build.from('users').select('id email').where(['name', eq()])
    expect(query.sql()).toBe('SELECT "id", "email"\nFROM "users"\nWHERE "name" = ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'ne with value',
  () => {
    const query = db.build.from('users').select('id email').where(['name', ne('Bobby Badger')])
    expect(query.sql()).toBe('SELECT "id", "email"\nFROM "users"\nWHERE "name" != ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe('Bobby Badger')
  }
)

test( 'ne with no value',
  () => {
    const query = db.build.from('users').select('id email').where(['name', ne()])
    expect(query.sql()).toBe('SELECT "id", "email"\nFROM "users"\nWHERE "name" != ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'lt with value',
  () => {
    const query = db.build.from('users').select('id').where(['age', lt(99)])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "age" < ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe(99)
  }
)

test( 'lt with no value',
  () => {
    const query = db.build.from('users').select('id').where(['age', lt()])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "age" < ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'le with value',
  () => {
    const query = db.build.from('users').select('id').where(['age', le(99)])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "age" <= ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe(99)
  }
)

test( 'le with no value',
  () => {
    const query = db.build.from('users').select('id').where(['age', le()])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "age" <= ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'gt with value',
  () => {
    const query = db.build.from('users').select('id').where(['age', gt(99)])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "age" > ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe(99)
  }
)

test( 'gt with no value',
  () => {
    const query = db.build.from('users').select('id').where(['age', gt()])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "age" > ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'ge with value',
  () => {
    const query = db.build.from('users').select('id').where(['age', ge(99)])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "age" >= ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe(99)
  }
)

test( 'ge with no value',
  () => {
    const query = db.build.from('users').select('id').where(['age', ge()])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "age" >= ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'isIn with array of values',
  () => {
    const query = db.build.from('users').select('id').where(['status', isIn(['pending', 'active'])])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "status" IN (?,?)')
    expect(query.allValues()).toStrictEqual(['pending', 'active'])
  }
)

test( 'isIn with values',
  () => {
    const query = db.build.from('users').select('id').where(['status', isIn('pending', 'active')])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "status" IN (?,?)')
    expect(query.allValues()).toStrictEqual(['pending', 'active'])
  }
)

test( 'notIn with array of values',
  () => {
    const query = db.build.from('users').select('id').where(['status', notIn(['pending', 'active'])])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "status" NOT IN (?,?)')
    expect(query.allValues()).toStrictEqual(['pending', 'active'])
  }
)

test( 'notIn with values',
  () => {
    const query = db.build.from('users').select('id').where(['status', notIn('pending', 'active')])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "status" NOT IN (?,?)')
    expect(query.allValues()).toStrictEqual(['pending', 'active'])
  }
)

test( 'isNull',
  () => {
    const query = db.build.from('users').select('id').where(['status', isNull()])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "status" is NULL')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'notNull',
  () => {
    const query = db.build.from('users').select('id').where(['status', notNull()])
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "status" is not NULL')
    expect(query.allValues().length).toBe(0)
  }
)


//--------------------------------------------------------------------------
// object: { column: comparator() }
//--------------------------------------------------------------------------
test( 'eq with value as column',
  () => {
    const query = db.build.from('users').select('email').where({ id: eq(99) })
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" = ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe(99)
  }
)

test( 'eq without value as column',
  () => {
    const query = db.build.from('users').select('email').where({ id: eq() })
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" = ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'ne with value as column',
  () => {
    const query = db.build.from('users').select('email').where({ id: ne(99) })
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" != ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe(99)
  }
)

test( 'ne without value as column',
  () => {
    const query = db.build.from('users').select('email').where({ id: ne() })
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" != ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'gt with value as column',
  () => {
    const query = db.build.from('users').select('email').where({ id: gt(99) })
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" > ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe(99)
  }
)

test( 'gt without value as column',
  () => {
    const query = db.build.from('users').select('email').where({ id: gt() })
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" > ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'ge with value as column',
  () => {
    const query = db.build.from('users').select('email').where({ id: ge(99) })
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" >= ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe(99)
  }
)

test( 'ge without value as columns',
  () => {
    const query = db.build.from('users').select('email').where({ id: ge() })
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" >= ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'lt with value as column',
  () => {
    const query = db.build.from('users').select('email').where({ id: lt(99) })
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" < ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe(99)
  }
)

test( 'lt without value as columns',
  () => {
    const query = db.build.from('users').select('email').where({ id: lt() })
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" < ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'le with value as column',
  () => {
    const query = db.build.from('users').select('email').where({ id: le(99) })
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" <= ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe(99)
  }
)

test( 'le without value as columns',
  () => {
    const query = db.build.from('users').select('email').where({ id: le() })
    expect(query.sql()).toBe('SELECT "email"\nFROM "users"\nWHERE "id" <= ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'isIn with array of values in object',
  () => {
    const query = db.build.from('users').select('id').where({ status: isIn(['pending', 'active']) })
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "status" IN (?,?)')
    expect(query.allValues()).toStrictEqual(['pending', 'active'])
  }
)

test( 'isIn with values in object',
  () => {
    const query = db.build.from('users').select('id').where({ status: isIn('pending', 'active') })
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "status" IN (?,?)')
    expect(query.allValues()).toStrictEqual(['pending', 'active'])
  }
)

test( 'notIn with array of values in object',
  () => {
    const query = db.build.from('users').select('id').where({ status: notIn(['pending', 'active']) })
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "status" NOT IN (?,?)')
    expect(query.allValues()).toStrictEqual(['pending', 'active'])
  }
)

test( 'notIn with values in object',
  () => {
    const query = db.build.from('users').select('id').where({ status: notIn('pending', 'active') })
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "status" NOT IN (?,?)')
    expect(query.allValues()).toStrictEqual(['pending', 'active'])
  }
)

test( 'isNull in object',
  () => {
    const query = db.build.from('users').select('id').where({ status: isNull() })
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "status" is NULL')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'notNull in object',
  () => {
    const query = db.build.from('users').select('id').where({ status: notNull() })
    expect(query.sql()).toBe('SELECT "id"\nFROM "users"\nWHERE "status" is not NULL')
    expect(query.allValues().length).toBe(0)
  }
)

//--------------------------------------------------------------------------
// Errors
//--------------------------------------------------------------------------

test( 'invalid comparator object',
  () => {
    const query = db.build.from('users').select('id').where({ status: { invalid: 'toot' } })
    expect(
      () => query.sql()
    ).toThrowError(
      `Invalid comparator object with "invalid" key specified for query builder "where" component. Expected object to contain "isNull", "notNull", etc.`
    )
  }
)

test( 'invalid and illegal comparator object',
  () => {
    const query = db.build.from('users').select('id').where({ status: { invalid: 'toot', illegal: 'parp' } })
    expect(
      () => query.sql()
    ).toThrowError(
      `Invalid comparator object with "invalid" and "illegal" keys specified for query builder "where" component. Expected object to contain "isNull", "notNull", etc.`
    )
  }
)

/*

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
*/