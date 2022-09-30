import test from 'ava';
import { schema } from '../../src/Schema.js'
import { mockDatabase } from '../library/database.js';


test(
  'no column sets',
  t => t.deepEqual(
    schema(
      mockDatabase,
      {
        table: 'foo',
      }
    ).columnSets,
    {
    }
  )
);

test(
  'default column set',
  t => t.deepEqual(
    schema(
      mockDatabase,
      {
        table: 'foo',
        columns: 'a b c',
      }
    ).columnSets,
    {
    }
  )
);

test(
  'column sets',
  t => {
    const s = schema(
      mockDatabase,
      {
        table: 'foo',
        columns: 'a b c d e f',
        columnSets: {
          abc: 'a b c',
          def: ['d', 'e', 'f'],
          bdf: {
            exclude: 'a c e'
          }
        }
      }
    )
    t.deepEqual(
      s.columnSets,
      {
        abc: ['a', 'b', 'c'],
        def: ['d', 'e', 'f'],
        bdf: ['b', 'd', 'f'],
      }
    )
  }
);

test(
  'column sets with virtual columns',
  t => {
    const s = schema(
      mockDatabase,
      {
        table: 'foo',
        columns: 'a b c d e f',
        virtualColumns: {
          ab: "CONCAT_WS(' ', a, b)",
          cd: "CONCAT_WS(' ', c, d)",
        },
        columnSets: {
          all1: 'a b c d e f ab cd',
          all2: {
            include: 'ab cd'
          },
        }
      }
    )
    t.deepEqual(
      s.columnSets,
      {
        all1: ['a', 'b', 'c', 'd', 'e', 'f', 'ab', 'cd'],
        all2: ['a', 'b', 'c', 'd', 'e', 'f', 'ab', 'cd'],
      }
    )
  }
);