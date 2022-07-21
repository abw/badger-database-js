import test from 'ava';
import Config from '../src/Config.js'
import Connection from '../src/Connection.js'

const connection = new Connection(Config);

test(
  'hello',
  t => t.is( connection.hello(), 'Hello World!' )
);

