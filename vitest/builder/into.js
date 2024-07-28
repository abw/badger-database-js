import { expect, test } from 'vitest'
import Into from '../../src/Builder/Into.js'
import { connect } from '../../src/Database.js'
import { sql } from '../../src/Utils/Tags.js'
import { expectOpTypeSql } from '../library/expect.js';

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'insert',
  () => expectOpTypeSql(
    db.build.into('a'),
    Into,
    'INTO "a"'
  )
)

test( 'INTO a',
  () => expectOpTypeSql(
    db.build.into('a'),
    Into,
    'INTO "a"'
  )
)

test( 'insert into',
  () => expect(
    db.build.insert().into('foo').sql()
  ).toBe(
    'INSERT\nINTO "foo"'
  )
)

test( 'into { sql }',
  () => expect(
    db.build.into({ sql: 'Hello World'}).sql()
  ).toBe(
    'INTO Hello World'
  )
)

test( 'into sql``',
  () => expect(
    db.build.into(sql`Hello World`).sql()
  ).toBe(
    'INTO Hello World'
  )
)

test( 'disconnect',
  () => db.disconnect()
)