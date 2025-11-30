import { expect, test } from 'vitest'
import { aliasMethods } from '../../src/Utils'

test( 'aliasMethods()',
  () => {
    const target = {
      a: 10,
      b: 20,
      c: 30
    }
    aliasMethods(target, { d: 'a', e: 'c' })
    expect(target).toStrictEqual({
      a: 10,
      b: 20,
      c: 30,
      d: 10,
      e: 30
    })
  }
)