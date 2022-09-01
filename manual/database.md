# Database

The `Database` class provides a wrapper around a
[Knex.js](https://knexjs.org/) database connection.

* [Overview](#overview)
* [Configuration](#configuration)
  * [Knex Configuration Options](#knex-configuration-options)
  * [tables](#tables)
* [Properties](#properties)
  * [connection](#connection)
  * [model](#model)
* [Methods](#methods)
  * [query(table)](#query-table-)
  * [raw(sql)](#raw-sql-)
  * [table(name)](#table-name-)
  * [escape(name)](#escape-name-)
  * [destroy()](#destroy--)
* [Function](#functions)
  * [database()](#database--)

## Overview

The `Database` class is used to create a top-level interface to your database.

Create a new database object using the configuration options described below.

```js
import Database from '@abw/badger-database';

const mydb = new Database({
  // configuration options
})
```

You can also use the `database()` function which is a wrapper around `new Database()`.

```js
import { database } from '@abw/badger-database';

const mydb = database({
  // configuration options
})
```

## Configuration

### Knex Configuration Options

The configuration parameters should include the
`client` and `connection` parameters as a minimum,
along with any other optional configuration parameters
accepted as
[Knex.js configuration options](https://knexjs.org/guide/#configuration-options)

For example, a connection to a `sqlite3` database might look like this:

```js
import Database from '@abw/badger-database'

const database = new Database({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
  pool: {
    min: 2,
    max: 10,
  }
})
```

## tables

Used to define table schemas.

```js
import Database from '@abw/badger-database'

const database = new Database(
  // ...client, connection, pool, etc...
  tables: {
    users: {
      // ... schema for users table
    },
    companies: {
      // ... schema for companies table
    }
  }
)
```

See the [Table](manual/table.html) manual page for further details.

## Properties

### connection

This is a reference to a [Connection](manual/connection.md) instance
which is a wrapper around the underlying Knex instance.

### model

This is a reference to a [Model](manual/model.md) proxy object which
provides a shorthand way to access table instances

## Methods

### query(table)

Returns a Knex query for the database.  Equivalent to calling `knex()`.

```js
const row =
  await database
    .query('user')
    .select('forename')
    .where({ email: 'bobby@badger.com' })
    .first()
```

### raw(sql)

Used to generate a raw SQL query for the database.  Equivalent to calling
`knex.raw()`.

```js
const rows =
  await database
    .raw('select forename from user where email="bobby@badger.com"');
```

### table(name)

Method to return a table object for a pre-defined table in the database.

```js
const users = database.table("users");
```
See the [Table](manual/table.html) manual page for further details.

### escape(name)

Used to escape a name according to the

### destroy()

Used to disconnect from the database and cleanup when you're finished.

## Functions

### database()

A function of convenience which wraps a call to `new Database()`.

```js
import { database } from '@abw/badger-database';
const db = database(...);
```

This is equivalent to:

```js
import { Database } from '@abw/badger-database';
const db = new Database(...);
```
