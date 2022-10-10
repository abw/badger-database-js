// This example shows debugging messages
import { connect, setDebug } from '../src/index.js';

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
  const users = await db.table('users');

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
