# Basic Queries

In these examples we'll look at some of the basic functionality of the
library using a database of users.

First we need to import the [`connect()`](/connecting) function and use it to
connect to a database.  In this case we'll create a local SQLite database in
the `test.db` file.

```js
import connect from '@abw/badger-database'

const db = connect({ database: 'sqlite://test.db' });
```

Now we can use the [`run()`](#run) method to execute a query to create the `users`
table.

```js
await db.run(
  `CREATE TABLE users (
    id    INTEGER PRIMARY KEY ASC,
    name  TEXT,
    email TEXT
  )`
);
```

Then we can insert a row.  The SQL query has `?` placeholders where values
should go.  These are then provided as an array, passed to the [`run()`](#run)
method as the second argument.

```js
const insert = await db.run(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['Bobby Badger', 'bobby@badgerpower.com']
);
console.log("Inserted ID:", insert.lastInsertRowid);
```

Now we can fetch that row back out.  Because we're expecting to get exactly
one row back, we call the [`one()`](#one) method which will return the row as a
Javascript object.

The arguments are the same as for the [`run()`](#run) method - a SQL query
followed by an array of any values corresponding to the `?` placeholders.

```js
const bobby = await db.one(
  'SELECT * FROM users WHERE email=?',
  ['bobby@badgerpower.com']
);
console.log("Fetched row:", bobby);
```

The final step is to disconnect the database.

```js
db.disconnect();
```

Note that most of the database functions are asynchronous and return
promises.  In these examples we're using the `await` keyword to wait for
requests to complete. You can, of course, use `.then(...)` if you prefer.

```js
import connect from '@abw/badger-database'

const db = connect({ database: 'sqlite://test.db' });

db.run(
  `CREATE TABLE users (
    id    INTEGER PRIMARY KEY ASC,
    name  TEXT,
    email TEXT
  )`
).then(
  () => db.run(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    ['Bobby Badger', 'bobby@badgerpower.com']
  )
).then(
  insert => console.log("Inserted ID:", insert.lastInsertRowid)
).then(
  () => db.one(
    'SELECT * FROM users WHERE email=?',
    ['bobby@badgerpower.com']
  )
).then(
  bobby => console.log("Fetched row:", bobby)
).then(
  () => db.disconnect()
)
```

## run(query, values, options) {#run}

The `run()` method is used to execute a query where you're not expecting
to return any rows from the database.  However, the method does return some
data include the number of rows changed, and in the case of `INSERT` queries,
the generated id for the record.

Different database engines return different values here.  For Sqlite it's
`changes` for the number of rows affected and `lastInsertRowid` for the id
of the insert row.  For Mysql it's `affectedRows` and `insertId`.  For
Postgres it's `rowCount` and if you want to get the id then you must add
`RETURNING id` to the end of the query.

We'll see in later examples using `tables` how the badger-database library
automatically standardises this response so that you always get back `changes`
and `id` (or whatever your id column is called) regardless of the database
engine.  But if you really can't wait until then, the trick is to pass a third
argument to the `run()` method as an object containing the `sanitizeResult`
key set to a `true` value.  Then you will always get back `changes` and `id`
for all database engines.

```js
// insert a row
const insert = await db.run(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['Bobby Badger', 'bobby@badgerpower.com'],
  { sanitizeResult: true }
);
console.log("Rows changed:", insert.changes);
console.log("Inserted ID:", insert.id);
```

## one(query, values, options) {#one}

The `one()` method should be used when you're expecting to fetch *exactly*
one row from the database.  The first argument is an SQL query string.  If
you  have any parameters to include in the query then they should be embedded
in the SQL using placeholders (`?` for Mysql and Sqlite, `$1`, `$2`, `$3`, etc.,
for Postgres).  Then pass the parameter values in an array as the second
argument.

```js
const bobby = await db.one(
  'SELECT * FROM users WHERE email=?',
  ['bobby@badgerpower.com']
);
console.log("Fetched row:", bobby);
```

The `one()` method will throw an `UnexpectedRowCount` exception if no rows, or
more than one row is returned with a message of the form
`N rows were returned when one was expected`.

## any(query, values, options) {#any}

The `any()` method can be used if you want to get one row which may or may not exist.

```js
const bobby = await db.any(
  'SELECT * FROM users WHERE email=?',
  ['bobby@badgerpower.com']
);
if (bobby) {
  console.log("Fetched row:", bobby);
}
else {
  console.log("Bobby Badger has gone missing!");
}
```

## all(query, values, options) {#all}

The `all()` method can be used to return multiple rows.

```js
const bobbies = await db.all(
  'SELECT * FROM users WHERE name=?',
  ['Bobby Badger']
);
if (bobbies.length) {
  console.log("Fetched %s users called 'Bobby Badger':", bobbies.length);
}
else {
  console.log("There aren't any users called 'Bobby Badger'");
}
```

## Where Next?

Read on to find out how to define reusable [named queries](/named-queries)
so that you don't have to litter your application code with SQL queries.

If you prefer to generate SQL queries programmatically then the
[query builder](query-builder) might also be of interest.




