import { expect, test } from 'vitest'
import Having from '../../src/Builder/Having.js'
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js'
import { expectOpTypeSql, expectToThrowErrorTypeMessage } from '../library/expect.js';

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'having',
  () => expectOpTypeSql(
    db.build.having('a'),
    Having,
    'HAVING "a" = ?'
  )
)

test( 'having string',
  () => expectOpTypeSql(
    db.build.having('name'),
    Having,
    'HAVING "name" = ?'
  )
)

test( 'having multiple columns as string',
  () => expectOpTypeSql(
    db.build.having('name email'),
    Having,
    'HAVING "name" = ? AND "email" = ?'
  )
)

test( 'array with two elements',
  () => {
    const query = db.build.having(['name', 'Bobby Badger']);
    expect(query.sql()).toBe('HAVING "name" = ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe('Bobby Badger')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe('Bobby Badger')
  }
)

test( 'array with three elements',
  () => {
    const query = db.build.having(['name', '!=', 'Bobby Badger']);
    expect(query.sql()).toBe('HAVING "name" != ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe('Bobby Badger')
  }
)

test( 'array with four elements',
  () => expectToThrowErrorTypeMessage(
    () => db.build.having(['users', 'email', 'email_address', 'oops']).sql(),
    QueryBuilderError,
    'Invalid array with 4 items specified for query builder "having" component. Expected [column, value] or [column, operator, value].'
  )
)

test( 'table name',
  () => expect(
    db.build.having('users.name', 'u.email').sql(),
  ).toBe(
    'HAVING "users"."name" = ? AND "u"."email" = ?'
  )
)

test( 'column with value',
  () => {
    const query = db.build.having({ name: 'Brian Badger' });
    expect(query.sql()).toBe('HAVING "name" = ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe('Brian Badger')
  }
)

test( 'column with comparison',
  () => {
    const query = db.build.having({ id: ['>', 99] });
    expect(query.sql()).toBe('HAVING "id" > ?')
    expect(query.allValues().length).toBe(1)
    expect(query.allValues()[0]).toBe(99)
  }
)

test( 'column with comparison operator',
  () => {
    const query = db.build.having({ id: ['>'] });
    expect(query.sql()).toBe('HAVING "id" > ?')
    expect(query.allValues().length).toBe(0)
  }
)

test( 'where() and having()',
  () => {
    const query = db.build.having({ b: 20 }).where({ a: 10 });
    expect(query.sql()).toBe('WHERE "a" = ?\nHAVING "b" = ?')
    const values = query.allValues();
    expect(values.length).toBe(2)
    expect(values[0]).toBe(10)
    expect(values[1]).toBe(20)
  }
)

test( 'where() and having() with interleaved values',
  () => {
    const query = db.build.where({ a: 10 }).where('b').having({ c: 30 }).having('d');
    expect(query.sql()).toBe('WHERE "a" = ? AND "b" = ?\nHAVING "c" = ? AND "d" = ?' )
    const values = query.allValues((s, w, h) => [...s, ...w, 20, ...h, 40]);
    expect(values.length).toBe(4)
    expect(values[0]).toBe(10)
    expect(values[1]).toBe(20)
    expect(values[2]).toBe(30)
    expect(values[3]).toBe(40)
  }
)

test( 'object with value array with three elements',
  () => expectToThrowErrorTypeMessage(
    () => db.build.having({ id: ['id', '>', 123] }).sql(),
    QueryBuilderError,
    'Invalid value array with 3 items specified for query builder "having" component. Expected [value] or [operator, value].'
  )
)

test( 'generateSQL() with single value',
  () => expect(
    Having.generateSQL('a')
  ).toBe(
    'HAVING a'
  )
)

test( 'generateSQL() with multiple values',
  () => expect(
    Having.generateSQL(['a', 'b'])
  ).toBe(
    'HAVING a AND b'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
