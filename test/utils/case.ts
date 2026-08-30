import { expect, test } from 'vitest'
import { snakeToStudlyPreserveCase } from '../../src/index'

test( 'foo_bar',
  () => expect(snakeToStudlyPreserveCase('foo_bar'))
    .toEqual('FooBar')
)

test( 'FooBar_baz',
  () => expect(snakeToStudlyPreserveCase('FooBar_baz'))
    .toEqual('FooBarBaz')
)
