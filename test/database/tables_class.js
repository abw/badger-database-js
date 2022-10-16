import test from 'ava';
import Table from '../../src/Table.js';
import Tables from '../../src/Tables.js';
import { connect } from '../../src/Database.js'

let db;
let fetchedTable = '';

// dummy Tables class which sets fetchTable so we can check
// it's being called
class MyTables extends Tables {
  table(name) {
    fetchedTable = name;
    return this.tables[name];
  }
}

test.before( 'connect',
  t => {
    db = connect({
      database: 'sqlite:memory',
      tablesClass: MyTables,
      tables: {
        users: {
          columns: 'id name email'
        }
      }
    })
    t.is( db.engine.engine, 'sqlite' );
  }
)

test.serial( 'users table',
  async t => {
    const users = await db.table('users');
    t.true( users instanceof Table );
    t.is( fetchedTable, 'users' );
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)