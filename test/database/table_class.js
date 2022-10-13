import test from 'ava';
import Table from '../../src/Table.js';
import { connect } from '../../src/Database.js'

let db;

class Users extends Table {
  configure(schema) {
    schema.columns = 'id name email'
  }
}

test.before(
  'database',
  t => {
    db = connect({
      database: 'sqlite:memory',
      tables: {
        users: Users,
      }
    })
    t.is( db.engine.engine, 'sqlite' );
  }
)

test.serial(
  'fetch users',
  async t => {
    const users = await db.table('users');
    t.true( users instanceof Table );
    t.is( users.columns.id.column, 'id' );
  }
)

test.after(
  () => db.disconnect()
)