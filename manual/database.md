# Database

The `Database` class provides a wrapper around a
[Knex.js](https://knexjs.org/) database connection.

* [Overview](#overview)
* [Configuration](#configuration)
  * [Knex Configuration Options](#knex-configuration-options)
  * [tables](#tables)
* [Methods](#methods)
  * [query(table)](#query-table-)
  * [raw(sql)](#raw-sql-)
  * [table(name)](#table-name-)
  * [escape(name)](#escape-name-)
  * [destroy()](#destroy--)

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

Used to defined table schemas.  See [Table](manual/table.html).

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
See [Table](manual/table.html).

### escape(name)

Used to escape a name according to the

### destroy()

Used to disconnect from the database and cleanup when you're finished.