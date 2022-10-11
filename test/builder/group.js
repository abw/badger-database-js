import test from 'ava';
import Group from '../../src/Builder/Group.js';
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js';
//import { sql } from '../../src/Utils/Tags.js';

let db;

test.before(
  'connect',
  async t => {
    db = await connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test(
  'group',
  t => {
    const op = db.builder().group('a');
    t.true( op instanceof Group )
    t.is( op.sql(), 'GROUP BY "a"' );
  }
)

test(
  'group string with table name',
  t => {
    const op = db.builder().group('a.b');
    t.is( op.sql(), 'GROUP BY "a"."b"' );
  }
)

test(
  'group string with multiple columns',
  t => {
    const op = db.builder().group('a b c');
    t.is( op.sql(), 'GROUP BY "a", "b", "c"' );
  }
)

test(
  'group array with one element',
  t => {
    const op = db.builder().group(['a.b']);
    t.is( op.sql(), 'GROUP BY "a"."b"' );
  }
)

test(
  'group object with column',
  t => {
    const op = db.builder().group({ column: 'a.b' });
    t.is( op.sql(), 'GROUP BY "a"."b"' );
  }
)

test(
  'group object with columns',
  t => {
    const op = db.builder().group({ columns: 'a b c' });
    t.is( op.sql(), 'GROUP BY "a", "b", "c"' );
  }
)

test(
  'invalid group array',
  t => {
    const error = t.throws(
      () => db.builder().group(['wibble', 'wobble', 'wubble']).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid array with 3 items specified for query builder "group" component. Expected [column].',
    );
  }
)


test(
  'invalid group object',
  t => {
    const error = t.throws(
      () => db.builder().group({ table: 'a', from: 'b' }).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid object with "from, table" properties specified for query builder "group" component.  Valid properties are "columns" and "column".',
    );
  }
)

test.after(
  'disconnect',
  t => {
    db.disconnect();
    t.pass();
  }
)
