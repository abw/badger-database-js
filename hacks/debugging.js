import { connect } from '../src/Database.js';
import { setDebug } from '../src/Utils/Debug.js';

setDebug({
  database: true,
  engine:   true,
  queries:  true,
  table:    true,
  record:   true,
})

async function main() {
  const db = await connect({
    database: 'sqlite:memory',
    // debug: true,
    tables: {
      users: {
        columns: 'id name email',
        // debug: true,
        recordConfig: {
          // debug: true
        }
      }
    }
  })
  await db.run(
    `CREATE TABLE users (
      id    INTEGER PRIMARY KEY ASC,
      name  TEXT,
      email TEXT
    )`
  );
  await db.run(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    ['Bobby Badger', 'bobby@badgerpower.com']
  )
  const user = await db.one(
    'SELECT * FROM users WHERE email=?',
    ['bobby@badgerpower.com']
  )
  const users = await db.table('users');
  const bobby = await users.oneRecord({
    email: 'bobby@badgerpower.com'
  });
  await bobby.update({
    name: 'Robert Badger'
  })
  db.disconnect();
}

main();
