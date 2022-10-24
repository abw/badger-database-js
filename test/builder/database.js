import test from 'ava';
import Database from '../../src/Builder/Database.js';
import From from '../../src/Builder/From.js';
import Select from '../../src/Builder/Select.js';
import Insert from '../../src/Builder/Insert.js';
import Update from '../../src/Builder/Update.js';
import Delete from '../../src/Builder/Delete.js';
import { connect } from '../../src/Database.js'

let db;

test.before( 'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test( 'builder',
  t => {
    const op = db.build;
    t.true( op instanceof Database );
  }
)

test( 'from',
  t => {
    const op = db.build.from();
    t.true( op instanceof From );
  }
)

test( 'select',
  t => {
    const op = db.select();
    t.true( op instanceof Select );
  }
)

test( 'insert',
  t => {
    const op = db.insert();
    t.true( op instanceof Insert );
  }
)
test( 'update',
  t => {
    const op = db.update();
    t.true( op instanceof Update );
  }
)

test( 'delete',
  t => {
    const op = db.delete();
    t.true( op instanceof Delete );
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)
