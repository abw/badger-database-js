import { expect, test } from 'vitest'
import { notImplemented, notImplementedInBaseClass, notImplementedInModule } from '../../src/Utils/Error'

test( 'notImplemented()',
  () => {
    expect(
      () => notImplemented('antigravity()', 'this Universe')
    ).toThrowError(
      "antigravity() is not implemented in this Universe"
    )
  }
)

test( 'notImplementedInModule()',
  () => {
    const notInThisUniverse = notImplementedInModule('this Universe');
    expect(
      () => notInThisUniverse('antigravity()')
    ).toThrowError(
      "antigravity() is not implemented in this Universe"
    )
  }
)

test( 'notImplementedInBaseClass()',
  () => {
    const notInThisUniverse = notImplementedInBaseClass('Universe');
    expect(
      () => notInThisUniverse('antigravity()')
    ).toThrowError(
      "antigravity() is not implemented in the Universe base class"
    )
  }
)

