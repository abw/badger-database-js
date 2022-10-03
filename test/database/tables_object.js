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

const tables = {
  users: {
    columns: 'id name email'
  }
};

test.serial(
  'database',
  async t => {
    db = await connect({
      database: 'sqlite:memory',
      tablesObject: new MyTables(tables),
    })
    t.is( db.engine.engine, 'sqlite' );
  }
)

test.serial(
  'model.artists',
  async t => {
    const users = await db.table('users');
    t.true( users instanceof Table );
    t.is( fetchedTable, 'users' );
  }
)

test.after(
  () => db.disconnect()
)