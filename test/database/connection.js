import test from 'ava';
import Connection from '../../src/Connection.js'
import { databaseConfig } from '../library/database.js';

const connection = new Connection(databaseConfig);

test(
  'connection.config',
  t => t.is( connection.config.client, 'sqlite3' )
);

