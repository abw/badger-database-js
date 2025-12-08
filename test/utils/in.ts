import { expect, test } from 'vitest'
import { isInOrNotIn } from '../../src/Utils/index'
import { IN, NOT_IN } from '../../src/Constants'

test( 'isInOrNotIn("in")',
  () => expect(
    isInOrNotIn("in")
  ).toBe(IN)
)
test( 'isInOrNotIn("IN")',
  () => expect(
    isInOrNotIn("in")
  ).toBe(IN)
)
test( 'isInOrNotIn("In")',
  () => expect(
    isInOrNotIn("in")
  ).toBe(IN)
)
test( 'isInOrNotIn("not in")',
  () => expect(
    isInOrNotIn("not in")
  ).toBe(NOT_IN)
)
test( 'isInOrNotIn("nOt    iN")',
  () => expect(
    isInOrNotIn("nOt    iN")
  ).toBe(NOT_IN)
)
