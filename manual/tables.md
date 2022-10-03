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
const db = await connect({
  database: 'sqlite:test.db',
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
  { name: 'Brian "The Brains" Badger' },
  { email: 'brian@badgerpower.com' }
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

In the next few sections we'll look at how [table columns](manual/table_columns.html)
are defined, the [table methods](manual/table_methods.html) that are provided, and how
to define your own custom [table class](manual/table_class.html) where you can put
additional functionality relating to a table.
