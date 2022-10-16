import test from 'ava';
import { connect } from '../../src/Database.js';

let db;

test.before( 'connect',
  t => {
    db = connect({
      database: 'sqlite:memory',
      tables: {
        people: {
          columns: 'a b c'
        },
        users: {
          table: 'user',
          columns: 'a b c'
        },
      }
    })
    t.is( db.engine.engine, 'sqlite' )
  }
)

test( 'default name',
  async t => {
    const people = await db.table('people');
    t.is( people.table, 'people' );
  }
)

test( 'custom name',
  async t => {
    const users = await db.table('users');
    t.is( users.table, 'user' );
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)