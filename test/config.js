import test from 'ava';
import { connection, pool } from '../src/Config.js'

test(
  'config host',
  t => t.is( connection.host, 'localhost' )
);

test(
  'config pool.min',
  t => t.is( pool.min, 2 )
);

