import test from 'ava';
import { format } from '../../src/Utils/Format.js';

test(
  'format()',
  t => t.is(
    format(
      'The <animal> sat on the <place>',
      { animal: 'cat', place: 'mat' }
    ),
    'The cat sat on the mat'
  )
)

test(
  'format() with zero',
  t => t.is(
    format(
      '<n> badger<s>',
      { n: 0, s: 's' }
    ),
    '0 badgers'
  )
)

test(
  'format() with empty string',
  t => t.is(
    format(
      '<n> badger<s>',
      { n: 1, s: '' }
    ),
    '1 badger'
  )
)

test(
  'format() with error from unbraced variable',
  t => {
    const error = t.throws(
      () => format(
        'The <animal> sat on the <badger>',
        { animal: 'cat', place: 'mat' }
      ),
    );
    t.is( error.message, 'Invalid variable expansion <badger> in message format: The <animal> sat on the <badger>' );
  }
)

