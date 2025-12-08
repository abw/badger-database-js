// TODO: this is testing the query building starting off a table.
// That still needs some work
import { expect, test } from 'vitest'
import Database from '../../src/Builder/Database.js'
import From from '../../src/Builder/From.js'
import { connect } from '../../src/Database.js'
import { DatabaseInstance } from '@/src/types'

let db: DatabaseInstance
let users;

test( 'connect',
  () => {
    db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          columns: 'id name email'
        }
      }
    });
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'users table',
  async () => {
    users = await db.model.users;
    expect(users.table).toBe('users')
  }
)

test( 'build',
  async () => {
    const builder = users.build;
    expect(builder).toBeInstanceOf(Database)
    expect(builder.database.engine.engine).toBe('sqlite')
  }
)

test( 'build from',
  async () => {
    const from = users.build.from('wibble')
    expect(from).toBeInstanceOf(From)
  }
)

test( 'select',
  async () => {
    const select = users.select('a, b, c');
    const sql = select.sql();
    expect(sql).toBe('SELECT "a", "b", "c"\nFROM "users"')
  }
)

test( 'from',
  async () => {
    const from = users.build.from('a, b, c');
    const sql = from.sql();
    expect(sql).toBe('FROM "a", "b", "c"')
  }
)

test( 'fetch',
  async () => {
    const fetch = users.select();
    const sql = fetch.sql();
    expect(sql).toBe('SELECT "users"."id", "users"."name", "users"."email"\nFROM "users"')
  }
)

test( 'fetch where',
  async () => {
    const select = users.select().where({ a: 10 });
    const sql = select.sql();
    expect(sql).toBe(`SELECT "users"."id", "users"."name", "users"."email"\nFROM "users"\nWHERE "a" = ?`)
  }
)

test( 'disconnect',
  () => db.disconnect()
)
