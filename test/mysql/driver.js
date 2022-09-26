import test from 'ava';
import Mysql from '../../src/Driver/Mysql/index.js'

test(
  'connect()',
  async t => {
    const mysql = new Mysql({ database: 'test', user: 'test', password: 'test', debug: true });
    const conn  = await mysql.connect();
    t.truthy(conn);
  }
)
