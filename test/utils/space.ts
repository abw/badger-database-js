import { expect, test } from 'vitest'
import { spaceBefore, spaceAfter, spaceAround, parens } from '../../src/Utils/index'

//--------------------------------------------------------------------------
// spaceBefore
//--------------------------------------------------------------------------
test( 'spaceBefore(null)',
  () => expect( spaceBefore(null) ).toBe('')
)

test( 'spaceBefore(undefined)',
  () => expect( spaceBefore(undefined) ).toBe('')
)

test( 'spaceBefore("")',
  () => expect( spaceBefore('') ).toBe('')
)

test( 'spaceBefore("hello")',
  () => expect( spaceBefore('hello') ).toBe(' hello')
)

//--------------------------------------------------------------------------
// spaceAfter
//--------------------------------------------------------------------------
test( 'spaceAfter(null)',
  () => expect( spaceAfter(null) ).toBe('')
)

test( 'spaceAfter(undefined)',
  () => expect( spaceAfter(undefined) ).toBe('')
)

test( 'spaceAfter("")',
  () => expect( spaceAfter('') ).toBe('')
)

test( 'spaceAfter("hello")',
  () => expect( spaceAfter('hello') ).toBe('hello ')
)

//--------------------------------------------------------------------------
// spaceAround
//--------------------------------------------------------------------------
test( 'spaceAround(null)',
  () => expect( spaceAround(null) ).toBe('')
)

test( 'spaceAround(undefined)',
  () => expect( spaceAround(undefined) ).toBe('')
)

test( 'spaceAround("")',
  () => expect( spaceAround('') ).toBe('')
)

test( 'spaceAround("hello")',
  () => expect( spaceAround('hello') ).toBe(' hello ')
)

//--------------------------------------------------------------------------
// parens
//--------------------------------------------------------------------------
test( 'parens(null)',
  () => expect( parens(null) ).toBe('')
)

test( 'parens(undefined)',
  () => expect( parens(undefined) ).toBe('')
)

test( 'parens("")',
  () => expect( parens('') ).toBe('')
)

test( 'parens("hello")',
  () => expect( parens('hello') ).toBe('(hello)')
)

