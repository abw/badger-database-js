import test from 'ava';
import Config from '../../src/Config.js'

test(
  'config host',
  t => t.is( Config.connection.host, 'localhost' )
);

test(
  'config pool.min',
  t => t.is( Config.pool.min, 2 )
);

