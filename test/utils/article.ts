import { expect, test } from 'vitest'
import { article } from '../../src/index'

test( 'an Aardvark',
  () => expect(article('Aardvark')).toBe('an')
)

test( 'an aardvark',
  () => expect(article('aardvark')).toBe('an')
)

test( 'a Badger',
  () => expect(article('Badger')).toBe('a')
)

test( 'a badger',
  () => expect(article('badger')).toBe('a')
)