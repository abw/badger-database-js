import { test } from 'vitest'
import { connect, SqliteEngine, registerEngine, EngineDriverError } from '../../src/index.js'
import { expectToThrowAsyncErrorTypeMessage } from '../library/expect.js';

class MySqliteEngine extends SqliteEngine {
  // this will fail because the module doesn't exist, but it
  // demonstrates that the SqliteEngine is trying to load it
  static driver = 'sqlite3-not-found'
}

registerEngine(MySqliteEngine)

test( 'new engine',
  async () => expectToThrowAsyncErrorTypeMessage(
    async () => {
      const db = connect({ database: 'sqlite:memory' });
      await db.run("SELECT 'hello world'")
    },
    EngineDriverError,
    /Failed to load "sqlite3-not-found"/
  )
)

