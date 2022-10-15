# Tables

It can quickly get tedious if you've got to write lots of different
queries for trivial operations like inserting, updating, selecting
and deleting rows.

In this example we introduce the concept of `tables`.  This allows you
to specify the columns in each table and use higher level methods to
automatically insert, update, select and delete rows from the table.

Note that we're using the same database from the previous examples
and assuming that the `users` table has already been created.

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

// fetch the users table
const users = await db.table('users');

// insert a row
await users.insert({
  name:  'Brian Badger',
  email: 'brian@badgerpower.com'
});

// update a row
await users.update(
  { name: 'Brian "The Brains" Badger' },  // set...
  { email: 'brian@badgerpower.com' }      // where...
);

// fetch a row
const brian = await users.oneRow({
  email: 'brian@badgerpower.com'
});
console.log(brian);

// delete a row
await users.delete({
  email: 'brian@badgerpower.com'
});
```

You can also define table specific named queries, either as static HTML or
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
