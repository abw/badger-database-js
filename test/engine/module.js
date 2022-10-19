import test from 'ava';
import { connect, SqliteEngine, registerEngine, EngineDriverError } from '../../src/index.js'

class MySqliteEngine extends SqliteEngine {
  // this will fail because the module doesn't exist, but it
  // demonstrates that the SqliteEngine is trying to load it
  static module = 'sqlite3-not-found'
}

registerEngine(MySqliteEngine)

test( 'new engine',
  async t => {
    await t.throwsAsync(
      async () => {
        const db = connect({ database: 'sqlite:memory' });
        await db.run("SELECT 'hello world'")
      },
      { instanceOf: EngineDriverError, message: /Failed to load "sqlite3-not-found"/ }
    );
  }
)

