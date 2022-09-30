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
    t.is(s.id, 'id')
    t.deepEqual(
      s.keyIndex,
      {
        id: true,
      }
    )
    t.deepEqual(
      s.keys,
      ['id'],
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
        columns: 'id name',
        id: 'id'
      }
    );
    t.is(s.id, 'id')
    t.deepEqual(
      s.keyIndex,
      {
        id: true,
      }
    )
    t.deepEqual(
      s.keys,
      ['id'],
    )
  }
);

test(
  'explicit id:email',
  t => {
    const s = schema(
      mockDatabase,
      {
        table: 'foo',
        columns: 'email name',
        id: 'email'
      }
    );
    t.is(s.id, 'email')
    t.deepEqual(
      s.keyIndex,
      {
        email: true,
      }
    )
    t.deepEqual(
      s.keys,
      ['email'],
    )
  }
);

test(
  'explicit keys',
  t => {
    const s = schema(
      mockDatabase,
      {
        table: 'employee',
        columns: 'user_id company_id job_title',
        keys: 'user_id company_id'
      }
    );
    t.is(s.id, undefined)
    t.deepEqual(
      s.keyIndex,
      {
        user_id: true,
        company_id: true,
      }
    )
    t.deepEqual(
      s.keys,
      ['user_id', 'company_id'],
    )
  }
);
