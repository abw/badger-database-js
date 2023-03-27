import test from 'ava';
import { connect } from '../../src/Database.js'

let db;

test.before( 'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test( 'build.from',
  t => {
    const op = db.build.from('a');
    t.is( op.sql(), 'FROM "a"' );
  }
)

test( 'build.select().from()',
  t => {
    const op = db.build.select('a').from('b');
    t.is( op.sql(), 'SELECT "a"\nFROM "b"' );
  }
)

test( 'build.where().select().from()',
  t => {
    const op = db.build.where('c').select('a').from('b');
    t.is( op.sql(), 'SELECT "a"\nFROM "b"\nWHERE "c" = ?' );
  }
)

test( 'stringification',
  t => {
    const op = db.build.where('c').select('a').from('b');
    t.is( `QUERY: ${op}`, 'QUERY: SELECT "a"\nFROM "b"\nWHERE "c" = ?' );
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)
