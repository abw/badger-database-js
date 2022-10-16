import test from 'ava';
import { connect } from '../../src/Database.js'

let db;

test.before( 'connect',
  t => {
    db = connect({
      database: 'sqlite:memory',
      queries: {
        selectBobby:
          db => db.select('*').from('user').where({ name: 'Bobby Badger' }),
      }
    });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test.serial( 'all() first time',
  async t => {
    const query = await db.query('selectBobby');
    t.deepEqual(query.values(), ['Bobby Badger'] );
  }
)

test.serial( 'all() second time',
  async t => {
    const query = await db.query('selectBobby');
    t.deepEqual(query.values(), ['Bobby Badger'] );
  }
)

test.serial( 'all() third time',
  async t => {
    const query = await db.query('selectBobby');
    t.deepEqual(query.values(), ['Bobby Badger'] );
  }
)

test.after( 'disconnect',
  t => {
    db.disconnect();
    t.pass();
  }
)