import test from 'ava';
import Into from '../../src/Builder/Into.js';
import { connect } from '../../src/Database.js'
import { sql } from '../../src/Utils/Tags.js';

let db;

test.before( 'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test( 'insert',
  t => {
    const op = db.build.into('a');
    t.true( op instanceof Into )
    t.is( op.sql(), 'INTO "a"' );
  }
)

test( 'INTO a',
  t => {
    const op = db.build.into('a');
    t.is( op.sql(), 'INTO "a"' );
  }
)

test( 'insert into',
  t => {
    const op = db.build.insert().into('foo');
    t.is( op.sql(), 'INSERT\nINTO "foo"' );
  }
)

test( 'into { sql }',
  t => {
    const op = db.build.into({ sql: 'Hello World'});
    t.is( op.sql(), 'INTO Hello World' );
  }
)

test( 'into sql``',
  t => {
    const op = db.build.into(sql`Hello World`);
    t.is( op.sql(), 'INTO Hello World' );
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)