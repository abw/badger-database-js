import test from 'ava';
import { Table, table } from '../../src/Table.js'
import { mockDatabase } from '../library/database.js';

test(
  'new Table',
  t => {
    const t1 = new Table(mockDatabase, { table: 't1' });
    t.is( t1.database, mockDatabase );
    t.is( t1.schema.table, 't1' );
    t.is( t1.schema.keys.length, 1 );
    t.is( t1.schema.id, 'id' );
  }
);

test(
  'table()',
  t => {
    const t2 = table(mockDatabase, { table: 't2' });
    t.is( t2.database, mockDatabase );
    t.is( t2.schema.table, 't2' );
    t.is( t2.schema.keys.length, 1 );
    t.is( t2.schema.id, 'id' );
  }
);

test(
  'table() with id',
  t => {
    const t3 = table(mockDatabase, { table: 't3', id: 'myId' });
    t.is( t3.schema.table, 't3' );
    t.is( t3.schema.id, 'myId' );
    t.is( t3.schema.keys.length, 1 );
    t.is( t3.schema.keys[0], 'myId' );
  }
);

test(
  'table() with keys',
  t => {
    const t4 = table(mockDatabase, { table: 't4', keys: 'parentId childId' });
    t.is( t4.schema.table, 't4' );
    t.is( t4.schema.id, undefined );
    t.is( t4.schema.keys.length, 2 );
    t.is( t4.schema.keys[0], 'parentId' );
    t.is( t4.schema.keys[1], 'childId' );
  }
);

