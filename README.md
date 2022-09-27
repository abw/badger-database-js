# Badger Database

This a library for building a database abstraction layer for your
projects.  It has support for accessing Postgres, MySQL and Sqlite
databases.

The aim is to provide a *Separation of Concerns* between your application
code and your database code so that you can write application code at a
higher level of abstraction, with the details of the database hidden away
in the lower levels.  It effectively allows you to build an API for your
application code to use (here we're using "API" in the original sense,
meaning a set of classes and methods which your application code can call,
rather than the more recent meaning of, say, a REST API which you call via
http requests).

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
records (aka "CRUD" - create, read, update, delete).  As well as removing the need to write lots of "boilerplate" queries to get your project up and running,
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

## Old Notes

NOTE: I'm in the process of rewriting this to remove Knex.  It has
proved to be more trouble than it's worth.  Everything you read below
this point may be out of date.

This is a simple but powerful database management tool that
is built around [Knex.js](https://knexjs.org/).  It is
designed for building database abstraction layers that allow
your application code to access a database while keeping the
nitty-gritty detail mostly hidden from view.

It embraces the power of both Knex and raw SQL, but provides
some of the basic functionality of ORMs to help automate many
of the tedious and repetitive tasks associated with using a
relational database.  It uses a variation of the Active Record
pattern - the variation being that the record objects are used
only to represent rows in a database with separate table classes
being employed to represent tables for a better separation of
concerns.

It is a work in progress loosely based on the Perl
[Badger::Database](https://github.com/abw/Badger-Database) library.
It is being written to help migrate a number of old Perl projects
to Javascript.

Feel free to use it for your own projects but be warned that
I wrote it to help me get my own job done.  I don't plan to spend
too much time supporting it, updating it, or adding features that
aren't immediately useful to me.

That said, it's a simple project totalling less than a thousand lines
of code.  An experienced Javascript programmer with knowledge of
Knex.js should be able to grok the code in an hour or so.  If you're
happy to use the source, Luke, then it may be the droids you're looking
for.  But if you're looking for a fully-featured, production-ready
solution then it might not be for you - there are *plenty* of other
Javascript ORMs that might be a better place to start.

For further information please read the [manual](https://abw.github.io/badger-database-js/docs/manual/index.html).

## Installation

Use your favourite package manager (we'll assume `npm` in these examples)
to install `@abw/badger-database`, `knex` and at least one of the driver modules.

```sh
    $ npm install @abw/badger-database knex

    # Then add one of the following:
    $ npm install pg
    $ npm install pg-native
    $ npm install sqlite3
    $ npm install better-sqlite3
    $ npm install mysql
    $ npm install mysql2
    $ npm install oracledb
    $ npm install tedious
```

See the [Knex.js installation guide](https://knexjs.org/guide/#node-js)
for further information.

## Quick Start

Import the `Database` module from `@abw/badger-database`
and create a database.  This example shows a `sqlite3`
in-memory database which is ideal for testing.

```js
const database = new Database({
  // Knex configuration options
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  pool: {
    min: 2,
    max: 10,
  },
  useNullAsDefault: true,

  // a simple users tables
  tables: {
    users: {
      columns: 'id name email',
    }
  }
})
```

Use the [raw()](https://abw.github.io/badger-database-js/docs/manual/database.html#raw-sql-) method to
run raw SQL queries.  For example, to create the `users` table:

```js
await database.raw(
  'CREATE TABLE users ( ' +
  '  id INTEGER PRIMARY KEY ASC, ' +
  '  name TEXT, ' +
  '  email TEXT ' +
  ')'
)
```

Use the
[table()](https://abw.github.io/badger-database-js/docs/manual/database.html#table-name-) method to fetch a
[Table](https://abw.github.io/badger-database-js/docs/manual/table.html)
object.

```js
const users = database.table('users');
```

Use the
[insertRow()](https://abw.github.io/badger-database-js/docs/manual/table.html#insertrow-data-)
method to insert a row.

```js
const bobby = await users.insertRow({
  name: 'Bobby Badger',
  email: 'bobby@badgerpower.com',
})
```

Use the
[fetchRow()](https://abw.github.io/badger-database-js/docs/manual/table.html#fetchrow-where-)
method to fetch a single row.

```js
const bobby = await table.fetchRow({
  email: 'bobby@badgerpower.com',
});
```

Append the
[record()](https://abw.github.io/badger-database-js/docs/manual/table.html#record-query-)
method to convert the returned row to a
[Record](https://abw.github.io/badger-database-js/docs/manual/record.html) object.

```js
const bobby = await table.fetchRow({
  email: 'bobby@badgerpower.com',
}).record();
```

You can then call the [update()](https://abw.github.io/badger-database-js/docs/manual/record.html#update-set-) method on the record.

```js
const roberto = await badger.update({
  name: 'Roberto Badger'
});
```

To construct more complex queries you can call the
[knex()](https://abw.github.io/badger-database-js/docs/manual/table.html#knex--) method to fetch a Knex
object.  This will have the table name pre-defined. You can then chain
as many Knex methods as you like to construct a query.

```js
const badger =
  await users
    .knex()
    .select('id, name')
    .where({ email: "bobby@badgerpower.com" })
    .first();
```

You can also call the [knex()](https://abw.github.io/badger-database-js/docs/manual/database.html#knex--) method on the
database.  In this case you need to specify the table that you're working
on.

```js
const row =
  await database
    .knex('user')
    .select('name')
    .where({ email: 'bobby@badgerpower.com' })
    .first()
```

# Author

Andy Wardley <abw@wardley.org>
