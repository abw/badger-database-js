import test from 'ava';
import { schema } from '../../src/Schema.js'
import { mockDatabase } from '../library/database.js';

test(
  'default id',
  t => {
    const s = schema(
      mockDatabase,
      {
        table: 'foo',
      }
    );
    t.deepEqual(
      s.identity({ id: 123, name: 'OneTwoThree' }),
      {
        id: 123,
      }
    )
  }
);

test(
  'explicit id',
  t => {
    const s = schema(
      mockDatabase,
      {
        table: 'foo',
        id: 'foo_id'
      }
    );
    t.deepEqual(
      s.identity({ foo_id: 456, name: 'OneTwoThree' }),
      {
        foo_id: 456,
      }
    )
  }
);

test(
  'compound keys',
  t => {
    const s = schema(
      mockDatabase,
      {
        table: 'foo',
        keys: 'foo_id bar_id'
      }
    );
    t.deepEqual(
      s.identity({ foo_id: 123, bar_id: 456, name: 'OneTwoThree' }),
      {
        foo_id: 123,
        bar_id: 456,
      }
    )
  }
);
