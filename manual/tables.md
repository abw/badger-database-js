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

## Table Columns

For simple cases you can define the table columns using a whitespace delimited string,
e.g. `id name email`.

```js
const db = await connect({
  // ...engine, etc...
  tables: {
    users: {
      columns: 'id name email'
    }
  }
});
```

You can add flags to the column names.  These include `required` to indicate
that a column must be provided when a row is inserted, and `readonly` to indicate
that a column cannot be inserted or updated.  Multiple flags can be added, each
separated by a colon.

```js
const db = await connect({
  // ...engine, etc...
  tables: {
    users: {
      columns: 'id:readonly name:required email:required'
    }
  }
});
```

If you try to insert a row without providing any of the `required` columns
then an error will be throw.

```js
// Throws a ColumnValidationError: 'Missing required column "email" for the users table'
await users.insert({
  name:  'Brian Badger',
});
```

The same thing will happen if you try to insert or update a `readonly` column.
(NOTE: you don't have to define your id column as being readonly if you want to
be able to insert rows with specific ids).

```js
// Throws a ColumnValidationError: 'The "id" column is readonly in the users table'
await users.insert({
  id:    999,
  name:  'Brian Badger',
  email: 'brian@badgerpower.com',
});
```

If your unique ID column isn't called `id` then you can mark the relevant column
using the `id` tag.

```js
const db = await connect({
  // ...engine, etc...
  tables: {
    users: {
      columns: 'user_id:readonly:id name:required email:required'
    }
  }
});
```

Defining the columns using a string is a convenient short hand for simpler
tables.  The more explicit form is to use an object with the column names as
keys.  The corresponding values can be strings containing any flags for the
columns, or an empty string if there aren't any.

```js
const db = await connect({
  // ...engine, etc...
  tables: {
    users: {
      columns: {
        user_id: 'readonly:id',
        name:    'required',
        email:   'required',
        comment: '',
    }
  }
});
```

Or you can fully expand them like so:

```js
const db = await connect({
  // ...engine, etc...
  tables: {
    users: {
      columns: {
        user_id: {
          readonly: true,
          id:       true
        },
        name: {
          required: true
        }
        email: {
          required: true
        }
        comment: { }
      }
    }
  }
});
```

## Table Methods

### insert()

The `insert()` method will construct and run an `INSERT` SQL query to insert a
row from the column data that you provide.

```js
const result = await users.insert({
  name:  'Brian Badger',
  email: 'brian@badgerpower.com'
});
console.log('Rows changed:', result.changes);
console.log('Generated id:', result.id);
```

The SQL query generated will look like this for Sqlite and Mysql:

```sql
INSERT INTO users (name, email)
VALUES (?, ?)
```

Note the use of value placeholders `?` to prevent SQL injection attacks.

The format for placeholders in Postgres is slightly different but has the
exact same effect:

```sql
INSERT INTO users (name, email)
VALUES ($1, $2)
```

The result returned from the `insert()` method is an object containing the
number of rows affected as `changes` and the generated id, where applicable in
`id`.  If you have defined a different id field (e.g. `user_id`) then this will
be returned instead.  Other data returned by the database engine may also be
defined.

You can insert multiple rows by passing an array of objects to the method.

```js
const results = await users.insert([
  {
    name:  'Bobby Badger',
    email: 'bobby@badgerpower.com'
  },
  {
    name:  'Brian Badger',
    email: 'brian@badgerpower.com'
  }
]);
console.log('Generated id #1:', results[0].id )
console.log('Generated id #2:', results[1].id )
```

The return value will be an array of results the same as those returned by
calling the method to insert a single row.

In some cases you may want to immediately fetch the inserted row back out of the
database.  This can be the case when you have columns with default values that
will be generated by the database (e.g. a `created` timestamp) that you want to
inspect.

You could easily do it yourself - the `insert()` method will return a result containing
the generated `id` (or other id field) which you can then use to fetch the record.
Or even easier, pass a second argument to the method as an object containing the
`reload` option set to a true value.

After inserting a row the table `insert()` method will immediately reload it from the
database and return the data for the row.

```js
const franky = await users.insert(
  {
    name:  'Franky Ferret',
    email: 'franky@ferrets-r-us.com'
  },
  { reload: true }
);
console.log("id:", franky.id);       // e.g. 3
console.log("name:", franky.name);   // Franky Ferret
console.log("email:", franky.email); // franky@ferrets-r-us.com
```

The same thing happens if you insert multiple rows and specify the `reload` options.
The only difference is that the return value will be an array of rows.

### update()

The `update()` method, as the name suggests, allows you to update rows.

```js
await users.update(
  { name: 'Brian "The Brains" Badger' },
  { email: 'brian@badgerpower.com' }
);
```

The first argument is an object containing the changes you want to make.
The second optional argument is the `WHERE` clause identifying the rows
you want to update.  You can omit the second argument if you want to update
all rows.

The SQL generated for the method call shown above will look something like this:

```sql
UPDATE users
SET    name=?
WHERE  email=?
```

Again, the format for Postgres is slightly different, using `$1` and `$2` for
placeholders instead of `?`, but works exactly the same.

### delete()

You can probably guess what the `delete()` method does.

```js
await users.delete({
  email: 'brian@badgerpower.com'
});
```

The object passed as the only argument identifies the rows that you want to delete.
You can omit this if you want to delete all rows in the table.
Naturally, you should use this method with caution.

The SQL generated will look something like this:

```sql
DELETE FROM users
WHERE email=?
```

### oneRow()

There are three different methods for fetching rows from the table using
selection criteria.  The `oneRow()` method will return a single row.
If the row isn't found or multiple rows match the criteria then an error
will be thrown.

```js
// returns a single row or throws an error
const brian = await users.oneRow({
  email: 'brian@badgerpower.com'
});
console.log('Brian:', brian);
```

You can pass a second argument which can contain various options to modify
the selection.  For example, the `columns` option can be used to specify
the columns that you want to select.  They can be specified as a string
containing the columns names separated by whitespace:

```js
const brian = await users.oneRow(
  { email: 'brian@badgerpower.com' },
  { columns: 'id name' }
);
```

Or as an array:

```js
const brian = await users.oneRow(
  { email: 'brian@badgerpower.com' },
  { columns: ['id', 'name'] }
);
```

The generated SQL for this method (and also `anyRow()` and `allRows()`)
will look something like this:

```sql
SELECT * FROM users
WHERE email=?
```


### anyRow()

The `anyRow()` method will return a single row if it exists or `undefined` if it doesn't.

```js
// returns a single row or undefined
const brian = await users.anyRow({
  email: 'brian@badgerpower.com'
});
if (brian) {
  console.log('Brian:', brian);
}
else {
  console.log('Brian Badger was not found');
}
```

### allRows()

The `allRows()` method will return an array of all matching rows.

```js
// returns an array of all rows (possibly empty)
const bobbies = await users.allRows({
  { name: 'Bobby Badger' }
);
if (bobbies.length) {
  console.log("Fetched %s users called 'Bobby Badger':", bobbies.length);
}
else {
  console.log("There aren't any users called 'Bobby Badger'");
}
```

If you want to return all matching rows then you can omit the criteria or
specify an empty object.

```js
const allUsers = await users.fetchAll();
```

```js
const allUsers = await users.fetchAll({ });
```

### oneRecord()

This method is a wrapper around `oneRow()` which returns the row as
a record object.

More on records below.

### anyRecord()

This method is a wrapper around `anyRow()` which returns the row as
a record object.

### allRecords()

This method is a wrapper around `allRows()` which returns the rows as
an array of record objects.

### run()

This is a low-level method for running any arbitrary SQL query where
you're not expecting to fetch any rows.  It's just like the `run()`
method on the database object.  The only difference is that there are
some table-specific fragments pre-defined: `table` contains the table
name and `columns` contains a comma separated list of all column names.
Any other `fragments` that you've specified in your table definition
will also be available.

The columns have the table name prepended and are property quoted for
the database.  For example, a `users` table having columns defined as
`id name email` will expand the `columns` SQL fragment as
`"users"."id", "users"."name", "users"."email"` for Sqlite and Postgres.
For Mysql the backtick character is used instead of double quotes.

As a trivial example, you can embed the `table` name in a query like so:

```js
users.run('DROP TABLE &lt;table&gt;')
```

### one()

This is another low-level method for running an SQL query where you're
expecting to get exactly one row returned.  It's just like the
corresponding `one()` database method, with the additional table-specific
SQL fragments available, as per `run()`.

```js
const bobby = users.one(
  'SELECT &lt;columns&gt; FROM &lt;table&gt; WHERE name=?',
  ['Bobby Badger']
)
```

### any()

This is yet another low-level method for running an SQL query, but where
you're expecting to get one row returned which may or may not exist.
It's just like the corresponding `any()` database method, with the additional
table-specific SQL fragments available, as per `run()`.

```js
const bobby = users.any(
  'SELECT &lt;columns&gt; FROM &lt;table&gt; WHERE name=?',
  ['Bobby Badger']
)
```

### all()

The final low-level method for running an SQL query where you're expecting to
get multiple rows.  It's just like the corresponding `all()` database method,
with the additional table-specific SQL fragments available, as per `run()`.

```js
const rows = users.all(
  'SELECT &lt;columns&gt; FROM &lt;table&gt;',
)
```

## Custom Table Class

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
