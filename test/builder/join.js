import test from 'ava';
import Join from '../../src/Builder/Join.js';
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
  'join',
  t => {
    const op = db.builder().join({ table: 'a', from: 'b', to: 'c' });
    t.true( op instanceof Join )
    t.is( op.sql(), 'JOIN "a" ON "b" = "a"."c"' );
  }
)

test(
  'join string',
  t => {
    const op = db.builder().join("b=a.c");
    t.is( op.sql(), 'JOIN "a" ON "b" = "a"."c"' );
  }
)

test(
  'join string with table name',
  t => {
    const op = db.builder().join("a.b=c.d");
    t.is( op.sql(), 'JOIN "c" ON "a"."b" = "c"."d"' );
  }
)

test(
  'join array with four elements',
  t => {
    const op = db.builder().join(['left', 'a.b', 'c', 'd']);
    t.is( op.sql(), 'LEFT JOIN "c" ON "a"."b" = "c"."d"' );
  }
)

test(
  'join array with three elements',
  t => {
    const op = db.builder().join(['a.b', 'c', 'd']);
    t.is( op.sql(), 'JOIN "c" ON "a"."b" = "c"."d"' );
  }
)

test(
  'join array with two elements',
  t => {
    const op = db.builder().join(['a.b', 'c.d']);
    t.is( op.sql(), 'JOIN "c" ON "a"."b" = "c"."d"' );
  }
)

test(
  'invalid join type',
  t => {
    const error = t.throws(
      () => db.builder().join({ type: 'wibble', table: 'a', from: 'b', to: 'c' }).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid join type "wibble" specified for query builder "join" component.  Valid types are "left", "right", "inner" and "full".'
    );
  }
)

test(
  'invalid join object',
  t => {
    const error = t.throws(
      () => db.builder().join({ talbe: 'a', from: 'b', to: 'c' }).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid object with "from, talbe, to" properties specified for query builder "join" component.  Valid properties are "type", "table", "from" and "to".',
    );
  }
)

test(
  'invalid join string',
  t => {
    const error = t.throws(
      () => db.builder().join('wibble=wobble').sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid join string "wibble=wobble" specified for query builder "join" component.  Expected "from=table.to".',
    );
  }
)

test(
  'invalid join array',
  t => {
    const error = t.throws(
      () => db.builder().join(['wibble', 'wobble']).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid array with 2 items specified for query builder "join" component. Expected [type, from, table, to], [from, table, to] or [from, table.to].',
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
