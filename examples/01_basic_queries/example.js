// This example shows the use of basic database queries.
import connect from '@abw/badger-database'

async function main() {
  // connect to a Sqlite database
  const db = connect({ database: 'sqlite:memory' });

  // create a table
  await db.run(
    `CREATE TABLE users (
      id    INTEGER PRIMARY KEY ASC,
      name  TEXT,
      email TEXT
    )`
  );

  // insert a row
  const insert = await db.run(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    ['Bobby Badger', 'bobby@badgerpower.com']
  );
  console.log("Inserted ID:", insert.lastInsertRowid);

  // fetch a row
  const bobby = await db.one(
    'SELECT * FROM users WHERE email=?',
    ['bobby@badgerpower.com']
  );
  console.log("Fetched row:", bobby);

  // update a row
  const update = await db.run(
    'UPDATE users SET name=? WHERE email=?',
    ['Robert Badger', 'bobby@badgerpower.com']
  );
  console.log("Updated row, %s row changed", update.changes);

  // fetch row with new data
  const robert = await db.one(
    'SELECT * FROM users WHERE email=?',
    ['bobby@badgerpower.com']
  );
  console.log("Fetched row:", robert);

  // delete a row
  const del = await db.run(
    'DELETE FROM users WHERE email=?',
    ['bobby@badgerpower.com']
  );
  console.log("Deleted row, %s row changed", del.changes);

  // cleanup
  db.disconnect();
}

main()
