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

## Examples of Use

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
      id INTEGER PRIMARY KEY ASC,
      name TEXT,
      email TEXT
    )`
  );

  // insert a row
  const insert = await db.run(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    'Bobby Badger', 'bobby@badgerpower.com'
  );
  console.log("Inserted ID:", insert.id);

  // fetch a row
  const bobby = await db.one(
    'SELECT * FROM users WHERE email=?',
    'bobby@badgerpower.com'
  );
  console.log("Fetched row:", bobby);
}

main()
```

Building on that, this second example adds a definition for the `user`
table so that we can benefit from the automatically generated queries
to insert, fetch, update and delete rows.

```js
import database from '@abw/badger-database'

async function main() {
  // connect to same Sqlite database from previous example
  const db = await database({
    engine: 'sqlite:test.db',
    tables: {
      users: {
        columns: 'id name email'
      }
    }
  });

  // insert a row
  const insert = await db.run(
    'INSERT INTO user (name, email) VALUES (?, ?)',
    'Bobby Badger', 'bobby@badgerpower.com'
  );
  console.log("Inserted ID:", insert.id);

  // fetch a row
  const bobby = await db.one(
    'SELECT * FROM user WHERE email=?',
    'bobby@badgerpower.com'
  );
  console.log("Fetched row:", bobby);
}

main()
```
