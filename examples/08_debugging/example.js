// This example shows debugging messages
import { connect, setDebug } from '@abw/badger-database';

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
    tables: {
      users: {
        columns: 'id name email',
        queries: {
          selectByName: `
            SELECT <columns> FROM <table> WHERE name=?
          `
        }
      }
    }
  })
  console.log('Creating users table');
  await db.run(
    `CREATE TABLE users (
      id    INTEGER PRIMARY KEY ASC,
      name  TEXT,
      email TEXT
    )`
  );
  console.log('Created users table');

  console.log('Inserting user');
  const insert = await db.run(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    ['Bobby Badger', 'bobby@badgerpower.com'],
    { sanitizeResult: true }
  )
  console.log('Inserted user #', insert.id);

  console.log('Fetching user');
  const user = await db.one(
    'SELECT * FROM users WHERE email=?',
    ['bobby@badgerpower.com']
  )
  console.log('Fetched user:', user);

  const users = await db.table('users');

  console.log('Fetching user record');
  const bobby = await users.oneRecord({
    email: 'bobby@badgerpower.com'
  });
  console.log('Fetched user record:', bobby.row);

  console.log('Updating user record');
  await bobby.update({
    name: 'Robert Badger'
  })
  console.log('Updated user record:', bobby.row);

  console.log('Fetching user record');
  const rob = await users.one(
    'selectByName',
    ['Robert Badger']
  );
  console.log('Fetched user record:', rob);

  console.log("Inserting table row");
  const brian = await users.insert({
    name: 'Brian Badger',
    email: 'brian@badgerpower.com'
  });
  console.log('Inserted user row', brian);

  console.log("Fetching table row");
  const brian2 = await users.oneRow({
    email: 'brian@badgerpower.com'
  });
  console.log('Fetched table row', brian2);

  console.log('Disconnecting');
  db.disconnect();
}

main();
