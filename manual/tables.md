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

## Insert, Update, Fetch and Delete

The table object provides methods to insert, update, fetch and delete
rows.  These methods all accept one or more objects specifying the data
that you want to use.

```js
await users.insert({
  name:  'Brian Badger',
  email: 'brian@badgerpower.com'
});

await users.update(
  { name: 'Brian "The Brains" Badger' },  // set...
  { email: 'brian@badgerpower.com' }      // where...
);

const rows = await users.fetch({
  email: 'brian@badgerpower.com'
});

await users.delete({
  email: 'brian@badgerpower.com'
});
```

These methods have variants for the cases where you're operating on a single
row or multiple rows.

For example, the [insert()](manual/table_methods.html#insert-data--options-)
method will call [insertOne()](manual/table_methods.html#insertone-data--options-)
if you pass it an object as the first parameter, or
[insertAll()](manual/table_methods.html#insertall-array--options-)
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

The [update()](manual/table_methods.html#update-set--where--options-) method
is an alias for [updateAll()](manual/table_methods.html#updateall-set--where--options-).
You can call also call the [updateAny()](manual/table_methods.html#updateany-set--where--options-)
method if you're expecting to update zero or one row,
or [updateOne()](manual/table_methods.html#updateone-set--where--options-) if you're expecting
to update exactly one row.  Both of these methods provide additional assertions to check
that the expected number of rows were updated (zero or one in the case of `updateAny()`, or
exactly one row in the case of `updateOne()`).

The [fetch()](manual/table_methods.html#fetch-where--options-) method
is an alias for [fetchAll()](manual/table_methods.html#fetchall-where--options-).
This returns an array of matching rows.  You can call also call the
[fetchAny()](manual/table_methods.html#fetchany-where--options-) method which will return a
single row if it exists or `undefined` if it doesn't. The
[fetchOne()](manual/table_methods.html#fetchone-where--options-) method returns a single
row if it exists and will throw an error if the row isn't found or multiple rows are returned.

The insert and fetch methods also have variants that return rows as [record](manual/records.html)
objects.

## Table Queries

You can also define table specific named queries, either as static SQL or
using the [query builder](manual/query_builder.html).  The table automatically
provides some pre-defined [query fragments](manual/query_fragments.html) to
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
          'SELECT &lt;columns&gt; FROM &lt;table&gt; WHERE name = ?',
        selectByEmail:
          // using a query builder
          t => t.select('id name email').from('users').where('email'),
        allBadgers:
          // using the .fetch query builder shortcut
          t => t.fetch.where({ animal: 'Badger' })
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

In the next few sections we'll look at how [table columns](manual/table_columns.html)
are defined, the [table methods](manual/table_methods.html) that are provided, how to
define and use [table queries](manual/table_queries.html), and how
to define your own custom [table class](manual/table_class.html) where you can put
additional functionality relating to a table.
