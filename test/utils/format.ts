import { expect, test } from 'vitest'
import { format } from '@abw/badger-utils'

// NOTE: format() used to be defined in this module but was a duplicate of
// the same function that was added to badger-utils.  We keep these tests
// here to assert that it behaves the same.

test( 'format()',
  () => expect(
    format(
      'The <animal> sat on the <place>',
      { animal: 'cat', place: 'mat' }
    )
  ).toBe(
    'The cat sat on the mat'
  )
)

test( 'format() with zero',
  () => expect(
    format(
      '<n> badger<s>',
      { n: 0, s: 's' }
    )
  ).toBe(
    '0 badgers'
  )
)

test( 'format() with empty string',
  () => expect(
    format(
      '<n> badger<s>',
      { n: 1, s: '' }
    )
  ).toBe(
    '1 badger'
  )
)

test( 'format() with error from unbraced variable',
  () => {
    expect(
      () => format(
        'The <animal> sat on the <badger>',
        { animal: 'cat', place: 'mat' }
      ),
    ).toThrowError(
      'Invalid variable expansion <badger> in message format: The <animal> sat on the <badger>'
    )
  }
)

