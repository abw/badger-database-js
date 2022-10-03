# Badger Database

This is a simple but powerful database management tool that allows you to
build database abstraction layers for your Javascript projects. It has
support for accessing Postgres, MySQL and Sqlite databases.

The aim is to provide a *Separation of Concerns* between your application
code and your database code so that you can write application code at a
higher level of abstraction, with the details of the database hidden away
in the lower levels.

## Philosophy

It is based on the philosphy that ORMs and SQL query builders are considered
*Mostly Harmful*.  SQL is an industry standard and has been for nearly 40
years.  Although there are some minor differences between dialects, it is
the most portable and widely understood way to communicate with a relational
database.  Any developer who has experience with using relational databases
should know at least the basics of SQL, regardless of the programming language
or database toolkits they are most familiar with.

Unlike most ORMs and SQL query builders which try to insulate developers from
SQL, this library embraces it and encourages you to use it in the way it was
intended to be used.  One of the keys benefits is transparency.  Your SQL
queries should not be hidden behind an abstraction that can obscure the
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

## Caveat

This is currently a work in progress loosely based on the Perl
[Badger::Database](https://github.com/abw/Badger-Database) library.
It is being written to help migrate a number of old Perl projects
to Javascript.

Feel free to use it for your own projects but be warned that
I wrote it to help me get my own job done.  I don't plan to spend
too much time supporting it, updating it, or adding features that
aren't immediately useful to me.

That said, it's a simple project totalling less than a thousand lines
of code.  An experienced Javascript programmer with knowledge of
SQL should be able to grok the code in an hour or so.  If you're
happy to use the source, Luke, then it may be the droids you're looking
for.  But if you're looking for a fully-featured, production-ready
solution then it might not be for you - there are *plenty* of other
Javascript ORMs that might be a better place to start.

For further information please read the
[manual](https://abw.github.io/badger-database-js/docs/manual/index.html).

## Installation

Use your favourite package manager (we'll assume `npm` in these examples)
to install `@abw/badger-database` and at least one of the driver modules.

```sh
    $ npm install @abw/badger-database

    # Then add one of the following:
    $ npm install pg
    $ npm install better-sqlite3
    $ npm install mysql2
```

## Quick Start

Import the `connect` function from `@abw/badger-database`
and create a database connection.  This example shows a `sqlite3`
in-memory database which is ideal for testing.

```js
const database = connect({
  database: 'sqlite:memory',
})
```

Use the [run()](https://abw.github.io/badger-database-js/docs/manual/basic_queries.html#run--)
method to run SQL queries.  For example, to create a `users` table:

```js
await database.run(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY ASC,
    name TEXT,
    email TEXT
  )`
)
```

Or to insert a row of data:

```js
const insert = await database.run(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['Bobby Badger', 'bobby@badgerpower.com']
);
console.log("Inserted ID:", insert.lastInsertRowid);
```

Use the [one()](https://abw.github.io/badger-database-js/docs/manual/basic_queries.html#one--)
method to fetch a row of data:

```js
const select = await database.one(
  'SELECT name, email FROM users WHERE email=?',
  ['bobby@badgerpower.com']
);
console.log("User Name:", select.name);
```

Define named queries and query fragments up front so that you don't have
to embed SQL in your application code:

```js
const database = connect({
  database: 'sqlite:memory',
  fragments: {
    selectUser: `
      SELECT name, email
      FROM users
    `
  },
  queries: {
    createUsers: `
      CREATE TABLE users (
        id INTEGER PRIMARY KEY ASC,
        name TEXT,
        email TEXT
      )`,
    insertUser: `
      INSERT INTO users (name, email)
      VALUES (?, ?)
    `,
    selectUserByEmail: `
      <selectUser>
      WHERE email=?
    `,
    selectUserByName: `
      <selectUser>
      WHERE name=?
    `,
  }
})
await database.run('createUsers');
await database.run(
  'insertUser',
  ['Bobby Badger', 'bobby@badgerpower.com']
);
const select = await database.one(
  'selectUserByEmail',
  ['bobby@badgerpower.com']
);
const select2 = await database.one(
  'selectUserByName',
  ['Bobby Badger']
);
```

Define tables to benefit from table-scoped queries and automatically generated
queries:

```js
const database = connect({
  database: 'sqlite:memory',
  tables: {
    users: {
      columns: 'id:readonly name:required email:required'
      queries: {
        create: `
          CREATE TABLE users (
            id INTEGER PRIMARY KEY ASC,
            name TEXT,
            email TEXT
          )`,
      }
    }
  }
})
await users = database.table('users');
await users.run('create');
await users.insert({
  name: 'Bobby Badger',
  email: 'bobby@badgerpower.com',
});
const select = await users.oneRow({
  email: 'bobby@badgerpower.com'
});
```

Use records to perform further operations on rows.

```js
const record = await users.oneRecord({
  email: 'bobby@badgerpower.com'
});
await record.update({
  name: 'Robert Badger'
});
await record.delete();
```

You can also define relations to connect records to related records,
and define your own custom table and record modules to
perform custom processing and implement your business logic.

Read the [fine manual](https://abw.github.io/badger-database-js/docs/manual/) for
further information.

# Author

Andy Wardley <abw@wardley.org>
