import test from 'ava';
import Sqlite from '../../src/Driver/Sqlite/index.js'
import Query from '../../src/Driver/Sqlite/Query.js'

const sqlite = new Sqlite({ filename: ":memory:" });
let conn;

test.before(
  'connect',
  async t => {
    conn = await sqlite.connect();
    t.pass("connected");
  }
)

test.serial(
  'create table',
  async t => {
    const query = await sqlite.query(
      conn,
      `CREATE TABLE user (
        id INTEGER PRIMARY KEY ASC,
        name TEXT,
        email TEXT
      )`
    )
    t.is(query instanceof Query, true);
    query.execute();
  }
)

test.serial(
  'insert rows',
  async t => {
    const insert = await sqlite.query(
      conn,
      `INSERT INTO user (name, email) VALUES (?, ?)`
    )
    t.is(insert instanceof Query, true);
    insert.execute('Bobby Badger', 'bobby@badgerpower.com');
    insert.execute('Brian Badger', 'brian@badgerpower.com');
  }
)

test.serial(
  'fetch one row',
  async t => {
    const fetch = await sqlite.query(
      conn,
      `SELECT id, name, email FROM user WHERE email=?`
    );
    t.is(fetch instanceof Query, true);
    const row = await fetch.one('bobby@badgerpower.com');
    t.is( row.name, 'Bobby Badger' );
  }
)

test.serial(
  'fetch all rows',
  async t => {
    const fetch = await sqlite.query(
      conn,
      `SELECT id, name, email FROM user`
    );
    t.is(fetch instanceof Query, true);
    const rows = await fetch.all();
    t.is( rows[0].name, 'Bobby Badger' );
    t.is( rows[1].name, 'Brian Badger' );
  }
)

