import test from 'ava';
import Sqlite from '../../src/Driver/Sqlite/index.js'

test(
  'no filename()',
  t => {
    const error = t.throws( () => new Sqlite() );
    t.is( error.message, 'No "filename" specified' )
  }
)

test(
  'connect()',
  async t => {
    const sqlite = new Sqlite({ filename: ":memory:" });
    const conn = await sqlite.connect();
    t.is(conn.open, true);
  }
)
