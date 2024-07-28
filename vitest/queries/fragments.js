import { expect, test } from 'vitest'
import { fail } from '@abw/badger-utils'
import { expandFragments } from '../../src/Utils/Queries.js'

const fragments = {
  table: 'badgers',
  someColumns: 'a, b, c',
  moreColumns: 'd, e, f',
  allColumns: '<someColumns>, <moreColumns>',
  select: 'SELECT <allColumns> FROM <table>',
  loopA: 'loopA then <loopB>',
  loopB: 'loopB then <loopA>',
}

const queryable = {
  fragment: name => fragments[name]
    || fail("Invalid query fragment in SQL expansion: <", name, ">")
}

test( 'expand query',
  () => expect(
    expandFragments('<select> WHERE a=10', queryable)
  ).toBe(
    'SELECT a, b, c, d, e, f FROM badgers WHERE a=10'
  )
)

test( 'expand query with typo throws an error',
  () => expect(
    () => expandFragments('<seletc> WHERE a=10', queryable)
  ).toThrowError(
    "Invalid query fragment in SQL expansion: <seletc>"
  )
)

test( 'expand query with runaway throws an error',
  () => expect(
    () => expandFragments('<loopA>', queryable)
  ).toThrowError(
    "Maximum SQL expansion limit (maxDepth=16) exceeded: loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB"
  )
)

test( 'expand query with runaway throws an error more soonly',
  () => expect(
    () => expandFragments('<loopA>', queryable, 5)
  ).toThrowError(
    "Maximum SQL expansion limit (maxDepth=5) exceeded: loopA -> loopB -> loopA -> loopB -> loopA"
  )
)
