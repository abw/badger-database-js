import { expect, test } from 'vitest'
import { toArray } from '../../src/index'

test( 'string',
  () => expect(toArray('apple'))
    .toEqual(['apple'])
)

test( 'number',
  () => expect(toArray(42))
    .toEqual([42])
)

test( 'string array',
  () => expect(toArray(['apple', 'banana']))
    .toEqual(['apple', 'banana'])
)

test( 'number array',
  () => expect(toArray([42, 69]))
    .toEqual([42, 69])
)

