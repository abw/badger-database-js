# Tutorial

In these examples we'll look at some of the basic functionality of the
library using a database of users.

## Basic Queries

This first example shows how to connect to a database, create a table,
insert a row and then fetch it out again.

Note that most of the database functions are asynchronous and return
promises.  In these examples we've wrapped the code in an `async` function
called `main()` so that we can use the `await` keyword to wait for requests
to complete. You can, of course, use `.then(...)` if you prefer.

```js
import connect from '@abw/badger-database'

async function main() {
  // connect to a Sqlite database
  const db = await connect({ database: 'sqlite:test.db' });

  // create a table
  await db.run(
    `CREATE TABLE users (
      id    INTEGER PRIMARY KEY ASC,
      name  TEXT,
      email TEXT
    )`
  );

  // insert a row
  const insert = await db.run(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    ['Bobby Badger', 'bobby@badgerpower.com']
  );
  console.log("Inserted ID:", insert.lastInsertRowid);

  // fetch a row
  const bobby = await db.one(
    'SELECT * FROM users WHERE email=?',
    ['bobby@badgerpower.com']
  );
  console.log("Fetched row:", bobby);
}

main()
```

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

The `one()` method will throw an exception if no rows, or more than one row is
returned.

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

## Named Queries

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
  database: 'sqlite:test.db',
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
  const db = await connect(dbConfig);

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

## Query Fragments

You might want to define a number of different queries for fetching user
rows using different search terms.  For example, to select a user by
`email` or `name`.

```js
const dbConfig = {
  database: 'sqlite:test.db',
  queries: {
    selectUserByEmail:
      'SELECT * FROM users WHERE email=?',
    selectUserByName:
      'SELECT * FROM users WHERE name=?'
  }
};
```

To avoid repetition, you can define named SQL `fragments` that can be embedded
into other queries.  Named fragments can be embedded into queries inside angle
brackets, e.g. `<fragmentName>`.

```js
const dbConfig = {
  database: 'sqlite:test.db',
  fragments: {
    selectUser:
      'SELECT * FROM users'
  },
  queries: {
    selectUserByEmail:
      '&lt;selectUser&gt; WHERE email=?',
    selectUserByName:
      '&lt;selectUser&gt; WHERE name=?'
  }
};
```

Fragments can reference other fragments.  This can be useful when you're building
more complex queries, as shown in this somewhat contrived example:

```js
const dbConfig = {
  database: 'sqlite:test.db',
  fragments: {
    selectUserCompany:
      'SELECT users.*, companies.* FROM users',
    joinUserCompany:
      'JOIN companies on users.company_id=companies.id',
    selectEmployee:
      '&lt;selectUserCompany&gt; &lt;joinUserCompany&gt;',
  },
  queries: {
    selectEmployeeByEmail:
      '&lt;selectEmployee&gt; WHERE email=?',
    selectEmployeeByName:
      '&lt;selectEmployee&gt; WHERE name=?'
  }
};
```

You can also embed fragments into ad-hoc queries passed to the
`run()`, `one()`, `any()` and `all()` methods.  For example,
given the above configuration you could write a custom query that
includes the `selectEmployee` fragment like so:

```js
const badgers = await db.all(
  '&lt;selectEmployee&gt; WHERE companies.name=?',
  ['Badgers Inc.']
);
```

## Table Definitions

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
const brian = await users.fetchOne({  // TODO: one() or oneRow()???
  email: 'brian@badgerpower.com'
});

// delete a row
await users.delete({
  email: 'brian@badgerpower.com'
});
```

For simple cases you can define the table columns using a whitespace, e.g.
`id name email`.

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

The `insert()` method will construct and run an `INSERT` SQL query to insert a
row from the column data that you provide.

```js
await users.insert({
  name:  'Brian Badger',
  email: 'brian@badgerpower.com'
});
```

The SQL query generated will look like this for Sqlite and Mysql:

```sql
INSERT INTO users (name, email)
VALUES (?, ?)
```

Note the use of value placeholders to prevent SQL injection attacks.

The format for placeholders in Postgres is slightly different but has the
exact same effect:

```sql
INSERT INTO users (name, email)
VALUES ($1, $1)
```

You can insert multiple rows by passing an array of objects to the method.

```js
await users.insert([
  {
    name:  'Bobby Badger',
    email: 'bobby@badgerpower.com'
  },
  {
    name:  'Brian Badger',
    email: 'brian@badgerpower.com'
  }
]);
```

** NOTE ** I'm going to change this so that you have to explicitly request a reload.

After inserting a row the table `insert()` method will immediately reload it from the
database.  This ensures that the data returned includes all columns, including the id
and any others that might be generated by the database (e.g. a `created` timestamp).

```js
const franky = await users.insert({
  name:  'Franky Ferret',
  email: 'franky@ferrets-r-us.com'
});
console.log("id:", franky.id);       // e.g. 3
console.log("name:", franky.name);   // Franky Ferret
console.log("email:", franky.email); // franky@ferrets-r-us.com
```

The same thing happens if you insert multiple rows, except that the return value will
be an array of rows.

If you would rather supress this behaviour then pass a second options argument as an
object containing the `reload` parameter set to `false`.

```js
const simon = await users.insert(
  {
    name:  'Simon Stoat',
    email: 'simon@stoat-stuff.com'
  },
  { reload: false }
);
```

Note that you will still get the generated `id` returned and the `changes` will
contain the number of rows change, in this case, 1.

```js
console.log("id:", simon.id);           // e.g. 4
console.log("changes:", simon.changes); // 1
// name, email, etc., are NOT included
```

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

** NOTE ** I'm considering renaming these to `one()`, `any()` and `all()`
or perhaps `oneRow()`, `anyRow()` and `allRows()`.

There are three different fetch methods, `fetchAny()` will return a single
row if it exists, `fetchAll()` will return an array of all matching rows.
The `fetchOne()` method is like `fetchAny()` in that it returns a single
row. However, it also asserts that exactly one row is returned.  If the
row does not exist, or if multiple rows are returned then it will throw
an error.

```js
// returns a single row or undefined
const brian = await users.fetchAny({
  email: 'brian@badgerpower.com'
});
```

```js
// returns a single row or throws an error
const brian = await users.fetchOne({
  email: 'brian@badgerpower.com'
});
```

The generated SQL will look something like this:

```sql
SELECT * FROM users
WHERE email=?
```

In all cases, the optional argument can be used to specify the selection
criteria.  It can be omitted or left empty if you want to return all rows,
although this usually only makes sense when using `fetchAll()`.

```js
// returns an array of rows
const allUsers = await users.fetchAll();
```

```js
// same as above
const allUsers = await users.fetchAll({ });
```

You can pass a second argument which can contain various options to modify
the selection.  For example, the `columns` option can be used to specify
the columns that you want to select.  They can be specified as a string
containing the columns names separated by whitespace:

```js
const brian = await users.fetchOne(
  { email: 'brian@badgerpower.com' },
  { columns: 'id name' }
);
```

Or as an array:

```js
const brian = await users.fetchOne(
  { email: 'brian@badgerpower.com' },
  { columns: ['id', 'name'] }
);
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
    return this.fetchAll({ animal: 'Badger' });
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
