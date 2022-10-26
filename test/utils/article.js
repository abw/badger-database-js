import test from 'ava';
import { article } from '../../src/index.js';

test( 'an Aardvark',
  t => t.is(
    article('Aardvark'), 'an'
  )
)

test( 'an aardvark',
  t => t.is(
    article('aardvark'), 'an'
  )
)

test( 'a Badger',
  t => t.is(
    article('Badger'), 'a'
  )
)

test( 'a badger',
  t => t.is(
    article('badger'), 'a'
  )
)