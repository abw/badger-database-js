import test from 'ava';
import Delete from '../../src/Builder/Delete.js';
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js';
import { sql } from '../../src/Utils/Tags.js';

let db;

test.before( 'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test( 'delete',
  t => {
    const op = db.build.delete();
    t.true( op instanceof Delete )
    t.is( op.sql(), 'DELETE' );
  }
)

test( 'delete a',
  t => {
    const op = db.build.delete('a');
    t.true( op instanceof Delete )
    t.is( op.sql(), 'DELETE "a"' );
  }
)

test( 'delete a.*',
  t => {
    const op = db.build.delete('a.*');
    t.is( op.sql(), 'DELETE "a".*' );
  }
)

test( 'delete from',
  t => {
    const op = db.build.delete().from('foo');
    t.is( op.sql(), 'DELETE\nFROM "foo"' );
  }
)

test( 'delete from where',
  t => {
    const op = db.build.delete().from('foo').where('x');
    t.is( op.sql(), 'DELETE\nFROM "foo"\nWHERE "x" = ?' );
  }
)

test( 'delete from where=10',
  t => {
    const op = db.build.delete().from('foo').where({ x: 10 });
    t.is( op.sql(), 'DELETE\nFROM "foo"\nWHERE "x" = ?' );
    t.deepEqual( op.whereValues(), [10] );
  }
)

test( 'delete { sql }',
  t => {
    const op = db.build.delete({ sql: 'Hello World'});
    t.is( op.sql(), 'DELETE Hello World' );
  }
)

test( 'delete sql``',
  t => {
    const op = db.build.delete(sql`Hello World`);
    t.is( op.sql(), 'DELETE Hello World' );
  }
)

test( 'delete select error',
  t => t.throws(
    () => db.build.delete().select('foo'),
    {
      instanceOf: QueryBuilderError,
      message: "select() is not a valid builder method for a DELETE query"
    }
  )
)

test.after( 'disconnect',
  () => db.disconnect()
)