import test from 'ava';
import { connect } from '../../src/Database.js';
import { SQLParseError } from '../../src/Utils/Error.js';
import { databaseConfig } from './database.js';
import { createUsersTableQuery } from './users_table.js';

export function runSyntaxErrorTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  let db;

  test.before( 'connect',
    t => {
      db = connect({ database });
      t.pass('connected')
    }
  )

  test.serial( 'create table',
    async t => {
      await db.run('DROP TABLE IF EXISTS users');
      await db.run(create);
      t.pass();
    }
  )

  test.serial( 'invalid query',
    async t => {
      const error = await t.throwsAsync(
        () => db.run('SELECT x\nFROM "pants"')
      )
      t.true( error instanceof SQLParseError )
      t.is( error.query, 'SELECT x\nFROM "pants"');
    }
  )

  test.after( 'disconnect',
    () => db.disconnect()
  )
}
