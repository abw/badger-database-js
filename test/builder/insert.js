import test from 'ava';
import Insert from '../../src/Builder/Insert.js';
import { connect } from '../../src/Database.js'

let db;

test.before( 'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test( 'insert',
  t => {
    const op = db.build.insert();
    t.true( op instanceof Insert )
    t.is( op.sql(), 'INSERT' );
  }
)

test( 'INSERT a',
  t => {
    const op = db.build.insert('a');
    t.is( op.sql(), 'INSERT' );
  }
)

test( 'insert into',
  t => {
    const op = db.build.insert().into('foo');
    t.is( op.sql(), 'INSERT\nINTO "foo"' );
  }
)

test( 'insert columns into',
  t => {
    const op = db.build.insert('a b c').into('foo');
    t.is( op.sql(), 'INSERT\nINTO "foo" ("a", "b", "c")' );
  }
)

test( 'insert columns into values',
  t => {
    const op = db.build.insert('a b c').into('foo').values(10, 20, 30);
    t.is( op.sql(), 'INSERT\nINTO "foo" ("a", "b", "c")\nVALUES (?, ?, ?)' );
    t.deepEqual( op.allValues(), [10, 20, 30] )
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)