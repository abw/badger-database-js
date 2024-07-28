import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import Table from '../../src/Table.js'

const db = connect({ database: 'sqlite:memory' })

test( 'new Table',
  () => {
    const t1 = new Table(db, { table: 't1', columns: 'a' });
    expect(t1.table).toBe('t1')
    expect(t1.keys.length).toBe(1)
    expect(t1.id).toBe('id')
  }
);

test( 'table with implicit id',
  () => {
    const t2 = new Table(db, { table: 't2', columns: 'a b' });
    expect(t2.table).toBe('t2')
    expect(t2.keys.length).toBe(1)
    expect(t2.id).toBe('id')
  }
);

test( 'table with explicit id',
  () => {
    const t3 = new Table(db, { table: 't3', id: 'myId', columns: 'myId a b c' });
    expect(t3.table).toBe('t3')
    expect(t3.id).toBe('myId')
    expect(t3.keys.length).toBe(1)
    expect(t3.keys[0]).toBe('myId')
  }
);

test( 'table with id marked in column',
  () => {
    const t3 = new Table(db, { table: 't3', columns: 'myId:id a b c' });
    expect(t3.table).toBe('t3')
    expect(t3.id).toBe('myId')
    expect(t3.keys.length).toBe(1)
    expect(t3.keys[0]).toBe('myId')
  }
);

test( 'table with keys',
  () => {
    const t4 = new Table(db, { table: 't4', keys: 'parentId childId', columns: 'parentId childId' });
    expect(t4.table).toBe('t4')
    expect(t4.id).toBe(undefined)
    expect(t4.keys.length).toBe(2)
    expect(t4.keys[0]).toBe('parentId')
    expect(t4.keys[1]).toBe('childId')
  }
);

test( 'table with keys marked in columns',
  () => {
    const t4 = new Table(db, { table: 't4', columns: 'parentId:key childId:key' });
    expect(t4.table).toBe('t4')
    expect(t4.id).toBe(undefined)
    expect(t4.keys.length).toBe(2)
    expect(t4.keys[0]).toBe('parentId')
    expect(t4.keys[1]).toBe('childId')
  }
);

