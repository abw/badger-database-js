import { expect, test } from 'vitest'
import { isIn } from '../../src/Utils/index.js'
import { IN, NOT_IN } from '../../src/Constants.js'

test( 'isIn("in")',
  () => expect(
    isIn("in")
  ).toBe(IN)
)
test( 'isIn("IN")',
  () => expect(
    isIn("in")
  ).toBe(IN)
)
test( 'isIn("In")',
  () => expect(
    isIn("in")
  ).toBe(IN)
)
test( 'isIn("not in")',
  () => expect(
    isIn("not in")
  ).toBe(NOT_IN)
)
test( 'isIn("nOt    iN")',
  () => expect(
    isIn("nOt    iN")
  ).toBe(NOT_IN)
)
