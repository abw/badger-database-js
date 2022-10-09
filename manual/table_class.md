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

  // disconnect
  db.disconnect();
}

main()
```

## Table Configuration

You can define a `configure()` function to your table class
to provide the configuration options.  It will be passed an
object containing any configuration options from the main
configuration for the table.  You can then add in any other
configuration options.

You can either update the `config` passed in as an argument,
or create a new configuration based on it.  In the latter case
you need to make sure you return the new configuration options
at the end of the method.

```js
export class Users extends Table {
  configure(config) {
    config.columns = 'id:readonly name:required email:required animal:required',
    config.queries = {
      create: `
        CREATE TABLE users (
          id     INTEGER PRIMARY KEY ASC,
          name   TEXT,
          email  TEXT,
          animal TEXT
        )`
    }
  }
  badgers() {
    // custom method to fetch all badgers
    return this.allRows({ animal: 'Badger' });
  }
}
```

When you define the `tables` for the database you then only need
to specify the `tableClass`.

```js
const db = await connect({
  database: 'sqlite:memory',
  tables: {
    users: {
      tableClass: Users,
    }
  }
});
```

If you don't have any other table configuration options that you
want to specify then you can use a shortcut and point the `users`
table directly at your class.

```js
const db = await connect({
  database: 'sqlite:memory',
  tables: {
    users: Users,
  }
});
```

