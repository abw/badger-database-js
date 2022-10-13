import test from 'ava';
import Database from '../../src/Builder/Database.js';
import From from '../../src/Builder/From.js';
import Select from '../../src/Builder/Select.js';
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
  'builder',
  t => {
    const op = db.builder();
    t.true( op instanceof Database );
  }
)

test(
  'from',
  t => {
    const op = db.from();
    t.true( op instanceof From );
  }
)

test(
  'select',
  t => {
    const op = db.select();
    t.true( op instanceof Select );
  }
)

test.after(
  () => db.disconnect()
)
