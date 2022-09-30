# Overview

This is a simple but powerful database management tool that
is designed for building database abstraction layers for your
projects. It has support for accessing Postgres, MySQL and Sqlite
databases.

The aim is to provide a *Separation of Concerns* between your application
code and your database code so that you can write application code at a
higher level of abstraction, with the details of the database hidden away
in the lower levels.

## Philosophy

It is based on the philosphy that ORMs and SQL query builders are considered
*Mostly Harmful*.  SQL is an industry standard and has been for nearly 40
years.  Although there are some minor differences between dialects, it is
the most portable and widely understood way to communicate with a database.
Any developer who has experience with using relational databases should know
at least the basics of SQL, regardless of the programming language or database
toolkits they are most familiar with.

Unlike most ORMs and SQL query builders which try to insulate developers from
SQL, this library embraces it and encourages you to use it in the way it was
intended to be used.  One of the keys benefits is transparency.  Your SQL
queries should not be hidden being an abstraction that can obscure the
intention or subtly transform the meaning.  This avoids a whole class of
"translation errors" that can result in the generated queries returning
the wrong results, being inefficient, or hard to reason about.

That said, there are a number of useful benefits that ORMs and SQL query
builders provide which this library has adopted.

* Abstraction of the underlying database engine.  Although it's probably not
that common for a project to migrate from one database engine to another
(and if that does happens you'll have plenty of other things to worry about),
it is quite common for developers to work on a number of projects over a
period of time that use different databases.  Having a library that
smooths over the differences between them can make it easier to switch from
one project to another.

* Automatic generation of "trivial" queries to insert, select, update and delete
records (aka "CRUD" - create, read, update, delete).  As well as removing the
need to write lots of "boilerplate" queries to get your project up and running,
this is also useful when you modify tables at a later date to add or remove
columns.  Those basic operations should automatically adapt to the new
schema without requiring you to rewrite lots of queries.

* The ability to compose complex queries in parts, allowing SQL fragments
to be reused in different queries that are similar, but not identical.
Doing this programmatically can not only save time, but also avoid potential
errors, either when writing them initially, or when updating them at a later
date to accommodate changes in the database schema.

* Entity models to help organise table and record-based code.  Each database
table can have its own table module defined where you can add custom methods
for inserting, selecting or performing other operations on rows in the table.
Similarly, every entity type can have its own record module where you can
add methods for performing operations on an individual entity instance.  This
is a lightweight variant of the Active Record pattern.

## Examples

In these examples we'll look at some of the basic functionality of the
library using a database of users.

### Basic Queries

This first example shows how to connect to a database, create a table,
insert a row and then fetch it out again.

Note that most of the database functions are asynchronous and return
promises.  In these examples we've wrapped the code in an `async` function
called `main()` so that we can use the `await` keyword to wait for requests
to complete. You can, of course, use `.then(...)` if you prefer.

```js
import database from '@abw/badger-database'

async function main() {
  // connect to a Sqlite database
  const db = await database({ engine: 'sqlite:test.db' });

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

The `run()` method is used to execute a query where we're not expecting
to return any rows from the database.  We do, however, get back some data
include the number of rows changed, and in the case of `INSERT` queries, the
generated id for the record.

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

The `one()` method is used when we're expecting to get *exactly* one row
returned.  It will throw an exception if no rows, or more than one row
is returned.  The `any()` method can be used if you want to get one row
which might not exist.  The `all()` method can be used to return multiple
rows.

### Named Queries

Instead of embedding SQL queries directly into our code, we can
define them as named queries.  This allows us to hide away some of the
details of the database implemenentation so that our application code
can be simpler and clearer.

To keep things simple, we'll demonstrate this with all the code in
one file, which isn't really hiding anything at all.  In practice,
you would usually move the database definition into a separate module.

```js
import database from '@abw/badger-database'

const dbConfig = {
  engine: 'sqlite:test.db',
  queries: {
    createUserTable:`
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
  // connect to a Sqlite database
  const db = await database(dbConfig);

  // create a table using a named query
  await db.run('createUserTable');

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

### Query Fragments

We might want to define a number of different queries for fetching user
rows using different search terms, for example.

```js
const dbConfig = {
  engine: 'sqlite:test.db',
  queries: {
    selectUserByEmail:
      'SELECT * FROM users WHERE email=?',
    selectUserByName:
      'SELECT * FROM users WHERE name=?'
  }
};
```

To avoid repetition, we can define named SQL `fragments` that can be embedded
into other queries.  Named fragments can be embedded into queries inside angle
brackets, e.g. `<fragmentName>`.

```js
const dbConfig = {
  engine: 'sqlite:test.db',
  fragments: {
    selectUser:
      'SELECT * FROM users'
  },
  queries: {
    selectUserByEmail:
      '<selectUser> WHERE email=?',
    selectUserByName:
      '<selectUser> WHERE name=?'
  }
};
```

Fragments can reference other fragments.  This can be useful when you're building
more complex queries.

```js
const dbConfig = {
  engine: 'sqlite:test.db',
  fragments: {
    selectUserCompany:
      'SELECT users.*, companies.* FROM users',
    joinUserCompany:
      'JOIN companies on users.company_id=companies.id',
    selectEmployee:
      '<selectUserCompany> <joinUserCompany>',
  },
  queries: {
    selectEmployeeByEmail:
      '<selectEmployee> WHERE email=?',
    selectEmployeeByName:
      '<selectEmployee> WHERE name=?'
  }
};
```

You can also embed fragments into ad-hoc queries passed to the
`run()`, `one()`, `any()` and `all()` methods.

```js
const badgers = await db.all(
  '<selectEmployee> WHERE companies.name=?',
  ['Badgers Inc.']
);
```

### Table Definitions

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
const db = await database({
  engine: 'sqlite:test.db',
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
const brian = await users.fetchOne({
  email: 'brian@badgerpower.com'
});

// delete a row
await users.delete({
  email: 'brian@badgerpower.com'
});
```

For simple cases you can define the table columns using a whitespace
delimited string, as show in the previous example.

```js
const db = await database({
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
const db = await database({
  // ...engine, etc...
  tables: {
    users: {
      columns: 'id:readonly name:required email:required'
    }
  }
});
```

If you try to insert a row without providing any of the `required` columns
then an error will be throw.  The same thing will happen if you try to insert
or update a `readonly` column.

If your unique ID column isn't called `id` then you can mark the relevant column
using the `id` tag.

```js
const db = await database({
  // ...engine, etc...
  tables: {
    users: {
      columns: 'user_id:readonly:id ...'
    }
  }
});
```

Defining the columns using a string is a convenient short hand for simpler
tables.  The more explicit form is to use an object with the column names as
keys.  The corresponding values can be strings containing any flags for the
columns, or an empty string if there aren't any.

```js
const db = await database({
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
const db = await database({
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

### Table Methods

The `insert()` method will construct an `INSERT` SQL query to insert a row from
the column data that you provide and then run it with the values provided.

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

The SQL generate will look something like this:

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

The key/value pairs in object passed as the only argument identify the rows
that you want to delete.  You can omit this if you want to delete all rows
in the table.  Naturally, you should use this method with caution.

The SQL generated will look something like this:

```sql
DELETE FROM users
WHERE email=?
```

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

