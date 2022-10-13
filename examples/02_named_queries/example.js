// This example shows the use of named database queries.
import connect from '@abw/badger-database'

async function main() {
  // connect to a Sqlite database
  const db = connect({
    database: 'sqlite:memory',
    queries: {
      create: `
        CREATE TABLE users (
          id    INTEGER PRIMARY KEY ASC,
          name  TEXT,
          email TEXT
        )`,
      insert: 'INSERT INTO users (name, email) VALUES (?, ?)',
      select: 'SELECT * FROM users WHERE email=?',
      update: 'UPDATE users SET name=? WHERE email=?',
      delete: 'DELETE FROM users WHERE email=?',
    }
  });

  // create a table
  await db.run('create');

  // insert a row
  const insert = await db.run(
    'insert',
    ['Bobby Badger', 'bobby@badgerpower.com']
  );
  console.log("Inserted ID:", insert.lastInsertRowid);

  // fetch a row
  const bobby = await db.one(
    'select',
    ['bobby@badgerpower.com']
  );
  console.log("Fetched row:", bobby);

  // update a row
  const update = await db.run(
    'update',
    ['Robert Badger', 'bobby@badgerpower.com']
  );
  console.log("Updated row, %s row changed", update.changes);

  // fetch row with new data
  const robert = await db.one(
    'select',
    ['bobby@badgerpower.com']
  );
  console.log("Fetched row:", robert);

  // delete a row
  const del = await db.run(
    'delete',
    ['bobby@badgerpower.com']
  );
  console.log("Deleted row, %s row changed", del.changes);

  // cleanup
  db.disconnect();
}

main()
