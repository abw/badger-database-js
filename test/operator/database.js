import test from 'ava';
import Database from '../../src/Operator/Database.js';
import { connect } from '../../src/Database.js'

let db;

test.serial(
  'connect',
  async t => {
    db = await connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test.serial(
  'operator',
  async t => {
    const op = db.operator();
    t.true( op instanceof Database );
  }
)
