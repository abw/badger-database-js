import test from 'ava';
import { connect } from '../../src/Database.js';
import Table from '../../src/Table.js'

const db = connect({ database: 'sqlite:memory' })

test( 'new Table',
  t => {
    const t1 = new Table(db, { table: 't1', columns: 'a' });
    t.is( t1.table, 't1' );
    t.is( t1.keys.length, 1 );
    t.is( t1.id, 'id' );
  }
);

test( 'table with implicit id',
  t => {
    const t2 = new Table(db, { table: 't2', columns: 'a b' });
    t.is( t2.table, 't2' );
    t.is( t2.keys.length, 1 );
    t.is( t2.id, 'id' );
  }
);

test( 'table with explicit id',
  t => {
    const t3 = new Table(db, { table: 't3', id: 'myId', columns: 'myId a b c' });
    t.is( t3.table, 't3' );
    t.is( t3.id, 'myId' );
    t.is( t3.keys.length, 1 );
    t.is( t3.keys[0], 'myId' );
  }
);

test( 'table with id marked in column',
  t => {
    const t3 = new Table(db, { table: 't3', columns: 'myId:id a b c' });
    t.is( t3.table, 't3' );
    t.is( t3.id, 'myId' );
    t.is( t3.keys.length, 1 );
    t.is( t3.keys[0], 'myId' );
  }
);

test( 'table with keys',
  t => {
    const t4 = new Table(db, { table: 't4', keys: 'parentId childId', columns: 'parentId childId' });
    t.is( t4.table, 't4' );
    t.is( t4.id, undefined );
    t.is( t4.keys.length, 2 );
    t.is( t4.keys[0], 'parentId' );
    t.is( t4.keys[1], 'childId' );
  }
);

test( 'table with keys marked in columns',
  t => {
    const t4 = new Table(db, { table: 't4', columns: 'parentId:key childId:key' });
    t.is( t4.table, 't4' );
    t.is( t4.id, undefined );
    t.is( t4.keys.length, 2 );
    t.is( t4.keys[0], 'parentId' );
    t.is( t4.keys[1], 'childId' );
  }
);

