# Named Queries

Instead of embedding SQL queries directly into your code, you can
define them as named queries.  This allows you to hide away some of the
details of the database implementation so that your application code
can be simpler and clearer.

To keep things simple, this example has all the code in one file,
which isn't really hiding anything at all.  In practice, you might want to
have your database configuration defined in a separate module that you can
import into any database script.

## queries

The `queries` configuration option can be passed to the [`connect()`](/connecting)
method to define named queries.

```js
import connect from '@abw/badger-database'

// connect to the database
const db = connect({
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
});
```

Then we can create the `users` table using the `createUsersTable` named query.

```js
await db.run('createUsersTable');
```

We can insert a row using the `insertUser` query.

```js
const insert = await db.run(
  'insertUser',
  ['Bobby Badger', 'bobby@badgerpower.com']
);
console.log("Inserted ID:", insert.lastInsertRowid);
```

And we can fetch a row using the `selectUserByEmail` query.

```js
const bobby = await db.one(
  'selectUserByEmail',
  ['bobby@badgerpower.com']
);
console.log("Fetched row:", bobby);
```

## query(name)

The `query()` method can be used to fetch a named query.

```js
const selectQuery = db.query('selectUserByName')
console.log(selectQuery)
// -> SELECT * FROM users WHERE email=?
```

## buildQuery(name)

The `buildQuery()` method can be used to fetch a named query as a
runnable query object.

```js
const selectQuery = db.buildQuery('selectUserByName')
const row = await selectQuery.one(['bobby@badgerpower.com'])
```

## Where Next?

In the next section we'll look at how you can define reusable
[query fragments](/query-fragments) that can be
embedded into your named queries.

You can also define named queries using the
[query builder](query-builder).