import test from 'ava';
import Driver from '../../src/Driver/Sqlite/index.js'
import Pool from '../../src/Pool.js'

test(
  'pool acquire and release',
  async t => {
    const driver = new Driver({ filename: ':memory:', debug: false });
    const pool = new Pool(driver, { debug: false });
    const conn = await pool.acquire();
    t.is(conn.open, true);
    t.is(pool.pool.numUsed(), 1);
    await pool.release(conn);
    t.is(pool.pool.numUsed(), 0);
    await pool.destroy();
    t.is(conn.open, false);
  }
)
