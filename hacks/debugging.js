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
        },
        queries: {
          selectByName: `
            SELECT <columns> FROM <table> WHERE name=?
          `
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
  const insert = await db.run(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    ['Bobby Badger', 'bobby@badgerpower.com']
  )
  console.log('Inserted user #', insert.id);

  const user = await db.one(
    'SELECT * FROM users WHERE email=?',
    ['bobby@badgerpower.com']
  )
  console.log('Fetched user:', user);

  const users = await db.table('users');
  const bobby = await users.oneRecord({
    email: 'bobby@badgerpower.com'
  });
  await bobby.update({
    name: 'Robert Badger'
  })
  const rob = await users.one(
    'selectByName',
    ['Robert Badger']
  );
  console.log('Fetched user:', rob);
  db.disconnect();
}

main();
