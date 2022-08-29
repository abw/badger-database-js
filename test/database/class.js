import test from 'ava';
import Database from '../../src/index.js'
import { hasValue } from '@abw/badger-utils';

test.serial(
  'Database',
  t => t.true( hasValue(Database) )
)
