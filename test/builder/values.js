import test from 'ava';
import Values from '../../src/Builder/Values.js';
import { connect } from '../../src/Database.js'
//import { QueryBuilderError } from '../../src/Utils/Error.js';
//import { sql } from '../../src/Utils/Tags.js';

let db;

test.before( 'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test( 'values value',
  t => {
    const op = db.build.values(10, 'b');
    t.true( op instanceof Values )
    t.is( op.sql(), 'VALUES (?, ?)' );
    t.deepEqual( op.allValues(), [10, 'b'])
  }
)

test( 'values',
  t => {
    const op = db.build.values([10, 20]);
    t.true( op instanceof Values )
    t.is( op.sql(), 'VALUES (?, ?)' );
    t.deepEqual( op.allValues(), [10, 20] )
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)