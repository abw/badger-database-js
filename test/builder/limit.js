import test from 'ava';
import Limit from '../../src/Builder/Limit.js';
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
  'limit',
  t => {
    const op = db.builder().limit(10);
    t.true( op instanceof Limit )
    t.is( op.sql(), 'LIMIT 10' );
  }
)

test(
  'limit called multiple times',
  t => {
    const op = db.builder().limit(10).limit(20);
    t.is( op.sql(), 'LIMIT 20' );
  }
)

test.after(
  'disconnect',
  t => {
    db.disconnect();
    t.pass();
  }
)