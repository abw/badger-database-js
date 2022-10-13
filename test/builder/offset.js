import test from 'ava';
import Offset from '../../src/Builder/Offset.js';
import { connect } from '../../src/Database.js'

let db;

test.before(
  'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test(
  'offset',
  t => {
    const op = db.build.offset(10);
    t.true( op instanceof Offset )
    t.is( op.sql(), 'OFFSET 10' );
  }
)

test(
  'offset called multiple times',
  t => {
    const op = db.build.offset(10).offset(20);
    t.is( op.sql(), 'OFFSET 20' );
  }
)

test(
  'limit and offset',
  t => {
    const op = db.build.limit(10).offset(20);
    t.is( op.sql(), 'LIMIT 10\nOFFSET 20' );
  }
)

test(
  'offset and limit',
  t => {
    const op = db.build.offset(20).limit(10);
    t.is( op.sql(), 'LIMIT 10\nOFFSET 20' );
  }
)

test(
  'generateSQL() with single value',
  t => {
    t.is( Offset.generateSQL('a'), 'OFFSET a' )
  }
)

test(
  'generateSQL() with multiple values',
  t => {
    t.is( Offset.generateSQL(['a', 'b']), 'OFFSET b' )
  }
)

test.after(
  () => db.disconnect()
)
