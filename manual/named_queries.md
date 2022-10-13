# Named Queries

Instead of embedding SQL queries directly into your code, you can
define them as named queries.  This allows you to hide away some of the
details of the database implemenentation so that your application code
can be simpler and clearer.

To keep things simple, this example has all the code in one file,
which isn't really hiding anything at all.  In practice, you would usually
move the database definition into a separate module.

```js
import connect from '@abw/badger-database'

const dbConfig = {
  database: 'sqlite://test.db',
  queries: {
    createUsersTable:`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY ASC,
        name TEXT,
        email TEXT
      )`,
    insertUser:
      'INSERT INTO users (name, email) VALUES (?, ?)',
    selectUserByEmail:
      'SELECT * FROM users WHERE email=?'
  }
};

async function main() {
  // connect to the database
  const db = connect(dbConfig);

  // create the users table using a named query
  await db.run('createUsersTable');

  // insert a row using a named query
  const insert = await db.run(
    'insertUser',
    ['Bobby Badger', 'bobby@badgerpower.com']
  );
  console.log("Inserted ID:", insert.lastInsertRowid);

  // fetch a row using a named query
  const bobby = await db.one(
    'selectUserByEmail',
    ['bobby@badgerpower.com']
  );
  console.log("Fetched row:", bobby);
}

main()
```

