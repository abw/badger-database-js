import { expect, test } from 'vitest'
import Engines from '../../src/Engines.js'
import Sqlite from '../../src/Engine/Sqlite.js'
import Mysql from '../../src/Engine/Mysql.js'
import Postgres from '../../src/Engine/Postgres.js'

test( 'sqlite engine',
  () => {
    const engine = Engines.sqlite({ engine: 'sqlite', filename: ':memory:' })
    expect(engine).toBeInstanceOf(Sqlite)
  }
)

test( 'mysql engine',
  () => {
    const engine = Engines.mysql({ engine: 'mysql', database: 'test' })
    expect(engine).toBeInstanceOf(Mysql)
  }
)

test( 'postgres engine',
  () => {
    const engine = Engines.postgres({ engine: 'postgres', database: 'test' })
    expect(engine).toBeInstanceOf(Postgres)
  }
)

test( 'postgresql engine',
  () => {
    const engine = Engines.postgresql({ engine: 'postgres', database: 'test' })
    expect(engine).toBeInstanceOf(Postgres)
  }
)
