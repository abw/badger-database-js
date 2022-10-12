import test from 'ava';
import Offset from '../../src/Builder/Offset.js';
import { connect } from '../../src/Database.js'

let db;

test.before(
  'connect',
  async t => {
    db = await connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test(
  'offset',
  t => {
    const op = db.builder().offset(10);
    t.true( op instanceof Offset )
    t.is( op.sql(), 'OFFSET 10' );
  }
)

test(
  'offset called multiple times',
  t => {
    const op = db.builder().offset(10).offset(20);
    t.is( op.sql(), 'OFFSET 20' );
  }
)

test(
  'limit and offset',
  t => {
    const op = db.builder().limit(10).offset(20);
    t.is( op.sql(), 'LIMIT 10\nOFFSET 20' );
  }
)

test(
  'offset and limit',
  t => {
    const op = db.builder().offset(20).limit(10);
    t.is( op.sql(), 'LIMIT 10\nOFFSET 20' );
  }
)

test.after(
  'disconnect',
  t => {
    db.disconnect();
    t.pass();
  }
)
