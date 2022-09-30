import test from 'ava';
import { schema } from '../../src/Schema.js'
import { mockDatabase } from '../library/database.js';


test(
  'columns string',
  t => t.deepEqual(
    schema(
      mockDatabase,
      {
        table: 'foo',
        columns: 'a b c'
      }
    ).columnIndex,
    {
      a: { column: 'a', tableColumn: 'foo.a' },
      b: { column: 'b', tableColumn: 'foo.b' },
      c: { column: 'c', tableColumn: 'foo.c' },
    }
  )
);

test(
  'columns array',
  t => t.deepEqual(
    schema(
      mockDatabase,
      {
        table: 'bar',
        columns: ['d', 'e', 'f'],
      }
    ).columnIndex,
    {
      d: { column: 'd', tableColumn: 'bar.d' },
      e: { column: 'e', tableColumn: 'bar.e' },
      f: { column: 'f', tableColumn: 'bar.f' },
    }
  )
);

test(
  'columns hash',
  t => t.deepEqual(
    schema(
      mockDatabase,
      {
        table: 'baz',
        columns: { g: { hello: 'world' }, h: { hello: 'there' } },
      }
    ).columnIndex,
    {
      g: { column: 'g', tableColumn: 'baz.g', hello: 'world' },
      h: { column: 'h', tableColumn: 'baz.h', hello: 'there' },
    }
  )
);

test(
  'columns with aliases',
  t => t.deepEqual(
    schema(
      mockDatabase,
      {
        table: 'qux',
        columns: { i: { column: 'india' }, j: { column: 'juliet' } },
      }
    ).columnIndex,
    {
      i: { column: 'india',  tableColumn: 'qux.india',  },
      j: { column: 'juliet', tableColumn: 'qux.juliet', },
    }
  )
);
