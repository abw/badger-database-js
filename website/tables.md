# Tables

It can quickly get tedious if you've got to write lots of different
queries for trivial operations like inserting, updating, selecting
and deleting rows.

In this example we introduce table objects.  This allows you
to specify the columns in each table and use higher level methods to
automatically insert, update, fetch and delete rows from the table.

Here's a simple example. Note that we're using the same database from
the previous examples and assuming that the `users` table has already
been created.

```js
// define the users table and the columns it contains
const db = connect({
  database: 'sqlite://test.db',
  tables: {
    users: {
      columns: 'id name email'
    }
  }
});
```

The database `table()` method is used to fetch a table object, using
the name that you defined for it.  Note that it's an asynchronous
function that returns a promise so you have to `await` it or use
`.then()`.

```js
// fetch the users table
const users = await db.table('users');
```

The name that you use for the table in your application (e.g. `users` in
this example) doesn't necessarily have to match the table name in the database.
If you want to refer to a table in your application using a plural name as
I typically do (e.g. `users`, `products`, etc.) but the underlying database
table is named in the singular (e.g. `user`, `product`) then you can use the
`table` option to set the database table name.

```js
const db = connect({
  database: 'sqlite://test.db',
  tables: {
    users: {                // app code refers to table as "users"...
      table:   'user',      // ...but the actual table name is "user"
      columns: 'id name email'
    }
  }
});
```

Any generated queries will use the database table name (e.g. `user` in this
example), rather than the name that you assigned to refer to the table
collection (e.g. `users`).  If you don't define the `table` option then
it defaults to using the name you're indexing it by in `tables` (e.g. `users`).

There is no general consensus about whether tables should be named using the
[singular or plural noun](https://stackoverflow.com/questions/338156/table-naming-dilemma-singular-vs-plural-names).  Most of the databases that
I've worked with (some designed by me, some by other people) use singular
names.  The argument goes that it makes more sense when writing a
query, e.g. `...WHERE user.id = ?`, although the opposite case is also
true when selecting from a table, e.g. `SELECT ... FROM users`.

In my application code I generally prefer to use plural names for the tables
because they're conceptually a collection. So my tables will be defined as
`users`, `products`, etc., even if the database table names are in the singular.
The same is true if I'm defining custom [table classes](table-class)
which will usually be in the plural (e.g. `Table/Users.js`, `Table/Products.js`).
For [record classes](record-class) I use the singular as they
represent a single record (e.g. `Record/User.js`, `Record/User.js`).

However, you don't have to follow this convention and you can define your
tables and records any way you like.

## insert()

The `insert()` method can be used to insert a row.

```js
await users.insert({
  name:  'Brian Badger',
  email: 'brian@badgerpower.com'
});
```

Pass an array of objects if you want to insert multiple rows.

```js
await users.insert([
  {
    name:  'Brian Badger',
    email: 'brian@badgerpower.com'
  },
  {
    name:  'Brenda Badger',
    email: 'brenda@badgerpower.com'
  }
);
```

## update()

The `update()` method can be used to update all records matching a
selection criteria.  The first argument should be an object containing
the columns you want to set, the second should be an object specifying the
selection criteria.

```js
await users.update(
  { name: 'Brian "The Brains" Badger' },  // set...
  { email: 'brian@badgerpower.com' }      // where...
);
```

## fetch()

The `fetch()` method will return all rows matching a criteria.

```js
const rows = await users.fetch({
  email: 'brian@badgerpower.com'
});
```

Note that we use `fetch()` rather than `select()` to fetch rows out of the
database. The `fetch()` method(s) generate queries based on the selection
criteria that you pass an argument.  The [`select()`](builder-methods#select-columns)
method (which the `fetch()` method uses) is used to generate custom queries
using the [query builder](query-builder).

```js
// using fetch() - specify the selection criteria
const rows = await users.fetch({
  email: 'brian@badgerpower.com'
});
// equivalent using select() - selection criteria are added via where()
const rows = await users.select().where({
  email: 'brian@badgerpower.com'
});
```

## delete()

Use the `delete()` method to delete rows that match a selection criteria.

```js
await users.delete({
  email: 'brian@badgerpower.com'
});
```

## One, Any, All

The `insert()`, `update()`, `fetch()` and `delete()` methods have variants
for the cases where you're operating on a single row or multiple rows.

For example, the [`insert()`](table-methods#insert-data-options)
method will call [`insertOne()`](table-methods#insertone-data-options)
if you pass it an object as the first parameter, or
[`insertAll()`](table-methods#insertall-array-options)
if you pass it an array.  You can call the methods directly if you prefer.

```js
// insert a single row
await users.insertOne(
  { name:  'Bobby Badger', email: 'bobby@badgerpower.com' }
);
// insert multiple rows
await users.insertAll([
  { name:  'Bobby Badger', email: 'bobby@badgerpower.com' }
  { name:  'Brian Badger', email: 'brian@badgerpower.com' }
]);
```

The [`update()`](table-methods#update-set-where-options) method
is an alias for [`updateAll()`](table-methods#updateall-set-where-options).
You can call also call the [`updateAny()`](table-methods#updateany-set-where-options)
method if you're expecting to update zero or one row,
or [`updateOne()`](table-methods#updateone-set-where-options) if you're expecting
to update exactly one row.  Both of these methods provide additional assertions to check
that the expected number of rows were updated (zero or one in the case of `updateAny()`, or
exactly one row in the case of `updateOne()`).

The [`fetch()`](table-methods#fetch-where-options) method
is an alias for [`fetchAll()`](table-methods#fetchall-where-options).
This returns an array of matching rows.  You can call also call the
[`fetchAny()`](table-methods#fetchany-where-options) method which will return a
single row if it exists or `undefined` if it doesn't. The
[`fetchOne()`](table-methods#fetchone-where-options) method returns a single
row if it exists and will throw an error if the row isn't found or multiple rows are returned.

The insert and fetch methods also have variants that return rows as
[record](records) objects.

## Table Queries

You can also define table specific named queries, either as static SQL or
using the [query builder](query-builder).  The table automatically
provides some pre-defined [query fragments](query-fragments) to
embed into queries (`<table>` and `<columns>`) and has some shortcuts that
can be used with the query builder, e.g. `.fetch` which automatically selects
all the table columns and defines the table name.

```js
const db = connect({
  database: 'sqlite://test.db',
  tables: {
    users: {
      columns: 'id name email'
      queries: {
        selectByName:
          // SQL query including table-specific fragments
          'SELECT <columns> FROM <table> WHERE name = ?',
        selectByEmail:
          // query builder with email value to be supplied
          t => t.select().where('email'),
        allBadgers:
          // query builder with pre-defined values
          t => t.select().where({ animal: 'Badger' })
      }
    },
  }
});

// fetch the users table
const users = await db.table('users');

// calling named queries
const user1 = await users.one('selectByName', ['Bobby Badger']);
const user2 = await users.any('selectByEmail', ['brian@badgerpower.com']);
const user3 = await users.all('allBadgers');
```

## Where Next?

In the next few sections we'll look at how [table columns](table-columns)
are defined, the [table methods](table-methods) that are provided, how to
define and use [table queries](table-queries), and how
to define your own custom [table class](table-class) where you can put
additional functionality relating to a table.
