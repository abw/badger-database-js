import test from 'ava';
import Range from '../../src/Builder/Range.js';
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js';

let db;

test.before(
  'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test(
  'range',
  t => {
    const op = db.builder().range(0, 9);
    t.true( op instanceof Range )
    t.is( op.sql(), 'LIMIT 10' );
  }
)

test(
  'range called multiple times',
  t => {
    const op = db.builder().range(10, 19).range(20, 29);
    t.is( op.sql(), 'LIMIT 10\nOFFSET 20' );
  }
)

test(
  'range with single argument',
  t => {
    const op = db.builder().range(100);
    t.is( op.sql(), 'OFFSET 100' );
  }
)

test(
  'range with object specifying from, to',
  t => {
    const op = db.builder().range({ from: 100, to: 119 });
    t.is( op.sql(), 'LIMIT 20\nOFFSET 100' );
  }
)

test(
  'range with object specifying from',
  t => {
    const op = db.builder().range({ from: 100 });
    t.is( op.sql(), 'OFFSET 100' );
  }
)

test(
  'range with object specifying to',
  t => {
    const op = db.builder().range({ to: 99 });
    t.is( op.sql(), 'LIMIT 100' );
  }
)

test(
  'range with object specifying limit',
  t => {
    const op = db.builder().range({ limit: 100 });
    t.is( op.sql(), 'LIMIT 100' );
  }
)

test(
  'range with object specifying offset',
  t => {
    const op = db.builder().range({ offset: 100 });
    t.is( op.sql(), 'OFFSET 100' );
  }
)

test(
  'range with no args',
  t => {
    const error = t.throws(
      () => db.builder().range().sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid arguments with 0 items specified for query builder "range" component. Expected (from, to), (from) or object.'
    )
  }
)

test(
  'range with three args',
  t => {
    const error = t.throws(
      () => db.builder().range(10, 20, 30).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid arguments with 3 items specified for query builder "range" component. Expected (from, to), (from) or object.'
    )
  }
)

test(
  'range with invalid object',
  t => {
    const error = t.throws(
      () => db.builder().range({ a: 10, b: 20 }).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid object with "a, b" properties specified for query builder "range" component.  Valid properties are "from", "to", "limit" and "offset".'
    )
  }
)

test(
  'range with invalid argument',
  t => {
    const error = t.throws(
      () => db.builder().range("a string").sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid argument specified for query builder "range" component. Expected (from, to), (from) or object.'
    )
  }
)

test.after(
  () => db.disconnect()
)
