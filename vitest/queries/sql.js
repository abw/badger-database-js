import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'

const db = connect({
  database: 'sqlite:memory',
  queries: {
    one: '<select> WHERE one=1',
    two: '<select> WHERE two=2',
  },
  fragments: {
    table: 'badgers',
    someColumns: 'a, b, c',
    moreColumns: 'd, e, f',
    allColumns: '<someColumns>, <moreColumns>',
    select: 'SELECT <allColumns> FROM <table>',
  }
})

test( 'query("one")',
  () => expect(
    db.sql('one')
  ).toBe(
    'SELECT a, b, c, d, e, f FROM badgers WHERE one=1'
  )
)

test( 'query("SELECT a FROM <table>")',
  () => expect(
    db.sql('SELECT a FROM <table>')
  ).toBe(
    'SELECT a FROM badgers'
  )
)

test( 'query("eleven")',
  () => expect(
    () => db.sql('eleven')
  ).toThrowError(
    'Invalid named query specified: eleven'
  )
)

test( 'query("two")',
  () => expect(
    db.sql('two')
  ).toBe(
    'SELECT a, b, c, d, e, f FROM badgers WHERE two=2'
  )
)
