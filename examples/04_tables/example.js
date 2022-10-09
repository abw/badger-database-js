// This example shows the use of a users table definition
import connect from '@abw/badger-database'

async function main() {
  // connect to a Sqlite database
  const db = await connect({
    database: 'sqlite:memory',
    tables: {
      // definition for the users table
      users: {
        // column names
        columns: 'id:readonly name:required email:required',
        // table-specific queries
        queries: {
          create: `
            CREATE TABLE users (
              id    INTEGER PRIMARY KEY ASC,
              name  TEXT,
              email TEXT
            )`,
        }
      }
    }
  });

  // fetch the users table object
  const users = await db.table('users');

  // run query to create database table
  await users.run('create');

  // insert a row
  const insert = await users.insert({
    name:  'Brian Badger',
    email: 'brian@badgerpower.com'
  });
  console.log("Inserted ID:", insert.id);

  // fetch a row
  const brian = await users.oneRow({
    email: 'brian@badgerpower.com'
  });
  console.log("Fetched row:", brian);

  // update a row
  const update = await users.update(
    { name: 'Brian "The Brains" Badger' },  // set...
    { email: 'brian@badgerpower.com' }      // where...
  );
  console.log("Updated row, %s row changed", update.changes);

  // fetch a row
  const brains = await users.oneRow({
    email: 'brian@badgerpower.com'
  });
  console.log("Fetched updated row:", brains);
  console.log(brains);

  // delete a row
  const del = await users.delete({
    email: 'brian@badgerpower.com'
  });
  console.log("Deleted row, %s row changed", del.changes);

  // disconnect
  db.disconnect()
}

main();