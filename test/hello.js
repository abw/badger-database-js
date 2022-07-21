import test from 'ava';

import { msg } from '../src/Database.js'

test(
  'msg',
  t => t.is( msg, 'Hello World!' )
);