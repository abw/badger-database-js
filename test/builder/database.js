import test from 'ava';
import Database from '../../src/Builder/Database.js';
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
  'builder',
  async t => {
    const op = db.builder();
    t.true( op instanceof Database );
  }
)
