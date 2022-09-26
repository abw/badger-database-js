import test from 'ava';
import Engines from '../../src/Engines.js'
import Sqlite from '../../src/Engine/Sqlite.js'
import Mysql from '../../src/Engine/Mysql.js'

test(
  'sqlite engine',
  async t => {
    const engine = await Engines.sqlite({ filename: ':memory:' })
    t.is( engine instanceof Sqlite, true )
  }
)

test(
  'mysql engine',
  async t => {
    const engine = await Engines.mysql({ connection: { database: 'test' } })
    t.is( engine instanceof Mysql, true )
  }
)
