import { expect, test } from 'vitest'
import Insert from '../../src/Builder/Insert.js'
import { connect } from '../../src/Database.js'
import { expectOpTypeSql } from '../library/expect.js';

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect( db.engine.engine).toBe('sqlite')
  }
)

test( 'insert',
  () => expectOpTypeSql(
    db.build.insert(),
    Insert,
    'INSERT'
  )
)

test( 'INSERT a',
  () => expectOpTypeSql(
    db.build.insert('a'),
    Insert,
    'INSERT'
  )
)

test( 'insert into',
  () => expect(
    db.build.insert().into('foo').sql()
  ).toBe(
    'INSERT\nINTO "foo"'
  )
)

test( 'insert columns into',
  () => {
    const op = db.build.insert('a b c').into('foo');
    expect(op.sql()).toBe('INSERT\nINTO "foo" ("a", "b", "c")\nVALUES (?, ?, ?)')
    expect(op.allValues()).toStrictEqual([])
  }
)

test( 'insert columns into values',
  () => {
    const op = db.build.insert('a b c').into('foo').values(10, 20, 30);
    expect(op.sql()).toBe('INSERT\nINTO "foo" ("a", "b", "c")\nVALUES (?, ?, ?)')
    expect(op.allValues()).toStrictEqual([10, 20, 30])
  }
)

test( 'disconnect',
  () => db.disconnect()
)