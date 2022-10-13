import test from 'ava';
import Order from '../../src/Builder/Order.js';
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js';
import { sql } from '../../src/Utils/Tags.js';

let db;

test.before(
  'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test(
  'order',
  t => {
    const op = db.build.order('a');
    t.true( op instanceof Order )
    t.is( op.sql(), 'ORDER BY "a"' );
  }
)

test(
  'order string with multiple columns',
  t => {
    const op = db.build.order('a b c.d');
    t.is( op.sql(), 'ORDER BY "a", "b", "c"."d"' );
  }
)

test(
  'order string with table name',
  t => {
    const op = db.build.order('a.b');
    t.is( op.sql(), 'ORDER BY "a"."b"' );
  }
)

test(
  'orderBy string with table name',
  t => {
    const op = db.build.orderBy('a.b');
    t.is( op.sql(), 'ORDER BY "a"."b"' );
  }
)

test(
  'order array with two elements',
  t => {
    const op = db.build.order(['a.b', 'DESC']);
    t.is( op.sql(), 'ORDER BY "a"."b" DESC' );
  }
)

test(
  'order array with one element',
  t => {
    const op = db.build.order(['a.b']);
    t.is( op.sql(), 'ORDER BY "a"."b"' );
  }
)

test(
  'order object with column',
  t => {
    const op = db.build.order({ column: 'a.b' });
    t.is( op.sql(), 'ORDER BY "a"."b"' );
  }
)

test(
  'order object with column and desc',
  t => {
    const op = db.build.order({ column: 'a.b', desc: true });
    t.is( op.sql(), 'ORDER BY "a"."b" DESC' );
  }
)

test(
  'order object with column and asc',
  t => {
    const op = db.build.order({ column: 'a.b', asc: true });
    t.is( op.sql(), 'ORDER BY "a"."b" ASC' );
  }
)

test(
  'order object with column and direction',
  t => {
    const op = db.build.order({ column: 'a.b', direction: 'DESC' });
    t.is( op.sql(), 'ORDER BY "a"."b" DESC' );
  }
)

test(
  'order object with column and dir',
  t => {
    const op = db.build.order({ column: 'a.b', dir: 'DESC' });
    t.is( op.sql(), 'ORDER BY "a"."b" DESC' );
  }
)

test(
  'order object with columns',
  t => {
    const op = db.build.order({ columns: 'a b c' });
    t.is( op.sql(), 'ORDER BY "a", "b", "c"' );
  }
)

test(
  'order object with columns and dir',
  t => {
    const op = db.build.order({ columns: 'a b c', dir: 'DESC' });
    t.is( op.sql(), 'ORDER BY "a", "b", "c" DESC' );
  }
)

test(
  'order object with columns and desc',
  t => {
    const op = db.build.order({ columns: 'a b c', desc: true });
    t.is( op.sql(), 'ORDER BY "a", "b", "c" DESC' );
  }
)

test(
  'order object with sql',
  t => {
    const op = db.build.order({ sql: 'Next Tuesday' });
    t.is( op.sql(), 'ORDER BY Next Tuesday' );
  }
)

test(
  'order with sql tagged template literal',
  t => {
    const op = db.build.order(sql`Next Tuesday`);
    t.is( op.sql(), 'ORDER BY Next Tuesday' );
  }
)

test(
  'invalid order array',
  t => {
    const error = t.throws(
      () => db.build.order(['wibble', 'wobble', 'wubble']).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid array with 3 items specified for query builder "order" component. Expected [column, direction] or [column].',
    );
  }
)


test(
  'invalid order object',
  t => {
    const error = t.throws(
      () => db.build.order({ table: 'a', from: 'b' }).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid object with "from, table" properties specified for query builder "order" component.  Valid properties are "columns", "column", "direction", "dir", "asc" and "desc".',

    );
  }
)

test(
  'generateSQL() with single value',
  t => {
    t.is( Order.generateSQL('a'), 'ORDER BY a' )
  }
)

test(
  'generateSQL() with multiple values',
  t => {
    t.is( Order.generateSQL(['a', 'b']), 'ORDER BY a, b' )
  }
)

test.after(
  () => db.disconnect()
)
