import test from 'ava';
import Engines from '../../src/Engines.js'
import Sqlite from '../../src/Engine/Sqlite.js'
import Mysql from '../../src/Engine/Mysql.js'
import Postgres from '../../src/Engine/Postgres.js'

test(
  'sqlite engine',
  async t => {
    const engine = await Engines.sqlite({ engine: 'sqlite', database: { filename: ':memory:' } })
    t.is( engine instanceof Sqlite, true )
  }
)

test(
  'mysql engine',
  async t => {
    const engine = await Engines.mysql({ engine: 'mysql', database: { database: 'test' } })
    t.is( engine instanceof Mysql, true )
  }
)

test(
  'postgres engine',
  async t => {
    const engine = await Engines.postgres({ engine: 'postgres', database: { database: 'test' } })
    t.is( engine instanceof Postgres, true )
  }
)

test(
  'postgresql engine',
  async t => {
    const engine = await Engines.postgresql({ engine: 'postgres', database: { database: 'test' } })
    t.is( engine instanceof Postgres, true )
  }
)
