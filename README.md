# Badger Database

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

For further information please read the [manual](docs/manual/index.html).

## Quick Start

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

Use the [raw()](docs/manual/database.html#raw-sql-) method to
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

Use the [table()](docs/manual/database.html#table-name-) to fetch a
[Table](docs/manual/table.html) object.

```js
const users = database.table('users');
```

Use the [insertRow()](docs/manual/table.html#insert-data-) method to
insert a row.

```js
const bobby = await users.insertRow({
  name: 'Bobby Badger',
  email: 'bobby@badger.com',
})
```

Use the [fetchRow()](docs/manual/table#fetchrow-where-) method to fetch
a single row.

```js
const bobby = await table.fetchRow({
  email: 'bobby@badger.com',
});
```

Append the [record()](docs/manual/table#record-query-) method to convert
the returned row to a [Record](docs/manual/record) object.

```js
const bobby = await table.fetchRow({
  email: 'bobby@badger.com',
}).record();
```

You can then call the [update()](docs/manual/record#update-set-) method on the record.

```js
const roberto = await badger.update({
  name: 'Roberto Badger'
});
```

To construct more complex queries you can call the
[knex()](docs/manual/table.html#knex--) method to fetch a Knex
object.  This will have the table name pre-defined. You can then chain
as many Knex methods as you like to construct a query.

```js
const badger =
  await users
    .knex()
    .select('id, name')
    .where({ email: "bobby@badger.com" })
    .first();
```

You can also call the [knex()](doc/manual/database#knex--) method on the
database.  In this case you need to specify the table that you're working
on.

```js
const row =
  await database
    .knex('user')
    .select('name')
    .where({ email: 'bobby@badger.com' })
    .first()
```

# Author

Andy Wardley <abw@wardley.org>
