// This example shows the use of a custom class for the users table
import { connect, Table } from '@abw/badger-database';

export class Users extends Table {
  badgers() {
    // custom method to fetch all badgers
    return this.allRows({ animal: 'Badger' });
  }
}

async function main() {
  const db = connect({
    database: 'sqlite:memory',
    tables: {
      users: {
        // bind in the custom table class
        tableClass: Users,
        // column definitions
        columns: 'id name email animal',
        // query definitions
        queries: {
          create: `
            CREATE TABLE users (
              id     INTEGER PRIMARY KEY ASC,
              name   TEXT,
              email  TEXT,
              animal TEXT
            )`
        }
      },
    }
  });

  // fetch users table object
  const users = await db.table('users');

  // run the 'create' query to create the database table
  await users.run('create');

  // insert some rows
  await users.insert([
    {
      name:   'Bobby Badger',
      email:  'bobby@badgerpower.com',
      animal: 'Badger'
    },
    {
      name:   'Brian Badger',
      email:  'brian@badgerpower.com',
      animal: 'Badger'
    },
    {
      name:   'Frankie Ferret',
      email:  'frank@ferret.com',
      animal: 'Ferret'
    }
  ]);

  // now call the custom badgers() method to fetch all badgers
  const badgers = await users.badgers();

  console.log(badgers.length, "badgers");
  console.log("First badger:", badgers[0]);
  console.log("Second badger:", badgers[1]);

  // cleanup
  db.disconnect();
}

main()