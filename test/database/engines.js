import test from 'ava';
import Engines from '../../src/Engines.js'
import Sqlite from '../../src/Engine/Sqlite.js'
import Mysql from '../../src/Engine/Mysql.js'
import Postgres from '../../src/Engine/Postgres.js'

test(
  'sqlite engine',
  t => {
    const engine = Engines.sqlite({ engine: 'sqlite', database: { filename: ':memory:' } })
    t.is( engine instanceof Sqlite, true )
  }
)

test(
  'mysql engine',
  t => {
    const engine = Engines.mysql({ engine: 'mysql', database: { database: 'test' } })
    t.is( engine instanceof Mysql, true )
  }
)

test(
  'postgres engine',
  t => {
    const engine = Engines.postgres({ engine: 'postgres', database: { database: 'test' } })
    t.is( engine instanceof Postgres, true )
  }
)

test(
  'postgresql engine',
  t => {
    const engine = Engines.postgresql({ engine: 'postgres', database: { database: 'test' } })
    t.is( engine instanceof Postgres, true )
  }
)
