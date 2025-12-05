// This example shows the use of basic database queries.
import { connect } from "../src/index.js"

async function main() {
  // connect to a Sqlite database
  const db = connect({ database: 'postgres://test:test@localhost/test' });

  // drop any existing table
  await db.run(
    `DROP TABLE IF EXISTS users`
  );

  // create a table
  await db.run(
    `CREATE TABLE users (
      id    SERIAL,
      name  TEXT,
      email TEXT
    )`
  );

  // insert a row
  const insert = await db.run(
    'INSERT INTO users (name, email) VALUES ($1, $2)',
    ['Bobby Badger', 'bobby@badgerpower.com']
  );
  console.log("Inserted ID:", insert.lastInsertRowid);

  // fetch a row
  const bobby = await db.one(
    'SELECT * FROM users WHERE email=$1',
    ['bobby@badgerpower.com']
  );
  console.log("Fetched row:", bobby);

  // update a row
  const update = await db.run(
    'UPDATE users SET name=$1 WHERE email=$2',
    ['Robert Badger', 'bobby@badgerpower.com']
  );
  console.log("Updated row, %s row changed", update.changes);

  // fetch row with new data
  const robert = await db.one(
    'SELECT * FROM users WHERE email=$1',
    ['bobby@badgerpower.com']
  );
  console.log("Fetched row:", robert);

  // delete a row
  const del = await db.run(
    'DELETE FROM users WHERE email=$1',
    ['bobby@badgerpower.com']
  );
  console.log("Deleted row, %s row changed", del.changes);

  // cleanup
  db.disconnect();
}

main()
