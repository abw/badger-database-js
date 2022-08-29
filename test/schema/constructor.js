import test from 'ava';
import { schema, Schema } from '../../src/Schema.js'
import { mockDatabase } from '../library/database.js';


test(
  'new Schema()',
  t => {
    const s = new Schema(mockDatabase, { table: 'foo' });
    t.is( s.table, 'foo' )
  }
);

test(
  'schema()',
  t => {
    const s = schema(mockDatabase, { table: 'bar' });
    t.is( s.table, 'bar' )
  }
);

