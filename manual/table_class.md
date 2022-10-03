# Table Class

You can define your own custom table class for each table in the database.
This allows you to add your own methods for performing queries on the table.
You should extend the `Table` base class and then define it as the `tableClass`
option in the table definition.

Here's a complete example.

```js
import { connect, Table } from '@abw/badger-database';

export class Users extends Table {
  badgers() {
    // custom method to fetch all badgers
    return this.allRows({ animal: 'Badger' });
  }
}

async function main() {
  const db = await connect({
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

  console.log(badgers.length);    // 2
  console.log(badgers[0].name);   // Bobby Badger
  console.log(badgers[1].name);   // Brian Badger
}

main()
```