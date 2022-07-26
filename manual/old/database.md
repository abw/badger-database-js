# Database

The `Database` class provides an interface to a database connection.

* [Overview](#overview)
* [Configuration](#configuration)
  * [queries](#queries)
  * [fragments](#fragments)
  * [tables](#tables)
  * [tablesClass](#tablesclass)
  * [tablesObject](#tablesobject)
* [Properties](#properties)
  * [connection](#connection)
  * [model](#model)
* [Methods](#methods)
  * [knex()](#knex--)
  * [raw(sql)](#raw-sql-)
  * [query(name)](#query-name-)
  * [hasTable(name)](#hastable-name-)
  * [table(name)](#table-name-)
  * [escape(name)](#escape-name-)
  * [destroy()](#destroy--)
* [Functions](#functions)
  * [database()](#database--)

## Overview

Use the asynchronous `database()` function to create an instance of the
`Database` class.  This provides a high-level interface to your database.

```js
import database from '@abw/badger-database';

const mydb = await database({
  // configuration options
})
```

## Configuration

### engine

The `engine` parameter is used to configure the underlying engine class
for talking to the database.

```js
const mydb = await database({
  engine: 'postgresql://username:password@hostname/database'
})
```

See the [Connecting](manual/connecting.html) page for full details.

### queries

Used to define named SQL queries that you can then run by calling the
[query(name)](#query-name-) method specifying the name of the query.

```js
const database = new Database(
  // ...client, connection, pool, etc...
  queries: {
    albumsByNumberOfTracks:
      'SELECT albums.title, COUNT(tracks.id) as n_tracks ' +
      'FROM albums ' +
      'JOIN tracks ' +
      'ON tracks.album_id=albums.id ' +
      'GROUP BY albums.id ' +
      'ORDER BY n_tracks ',
  }
)
```

See the [Queries](manual/queries.html) manual page for further information.

### fragments

Use to define commonly used SQL fragments that can be interpolated into
named [queries](#queries).

```js
const database = new Database(
  // ...client, connection, pool, etc...
  fragments: {
    selectAlbumsWithTrackCount:
      'SELECT albums.title, COUNT(tracks.id) as n_tracks ' +
      'FROM albums ' +
      'JOIN tracks ' +
      'ON tracks.album_id=albums.id ' +
      'GROUP BY albums.id '
  },
  queries: {
    albumsByNumberOfTracks:
      '&lt;selectAlbumsWithTrackCount&gt; ' +
      'ORDER BY n_tracks ',
    albumWithMostTracks:
      '&lt;selectAlbumsWithTrackCount&gt; ' +
      'ORDER BY n_tracks DESC ' +
      'LIMIT 1',
  }
)
```

See the [Queries](manual/queries.html) manual page for further information.

### tables

Used to define table schemas.

```js
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

### tablesClass

This can be used to provide an alternate class for returning table
configuration options.  The default is the [Tables](manual/tables.html) class.

### tablesObject

This can be used to provide a pre-instantiated object for returning table
configuration options.  See the [Tables](manual/tables.html) pages for
further information.

## Properties

### engine

This is a reference to an [Engine](manual/engine.html) instance.

### model

This is a reference to a [Model](manual/model.html) proxy object which
provides a shorthand way to access table instances

### queries

This is a reference to a [Queries](manual/model.html) object which
manages named SQL [queries](#queries).

## Methods

### knex()

Returns a Knex query for the database.
Equivalent to calling `database.connection.knex()`.

```js
const row =
  await database
    .knex('user')
    .select('forename')
    .where({ email: 'bobby@badgerpower.com' })
    .first()
```

### raw(sql)

Used to generate a raw SQL query for the database.  Equivalent to calling
`knex.raw()`.

```js
const rows =
  await database
    .raw('select forename from user where email="bobby@badgerpower.com"');
```

### query(name)

This method allows you to execute a named query that was previously
defined using the [queries](#queries) configuration option.

Given this database definition:

```js
const database = new Database(
  // ...client, connection, pool, etc...
  queries: {
    albumsByNumberOfTracks:
      'SELECT albums.title, COUNT(tracks.id) as n_tracks ' +
      'FROM albums ' +
      'JOIN tracks ' +
      'ON tracks.album_id=albums.id ' +
      'GROUP BY albums.id ' +
      'ORDER BY n_tracks ',
  }
)
```

You can then run the query like so:

```js
const albums = await database.query('albumsByNumberOfTracks');
```

### hasTable(name)

Method to check if a table exists.  Returns the configuration options
for the table or a false value if the table doesn't exist.

### table(name)

Method to return a table object for a pre-defined table in the database.

```js
const users = database.table("users");
```
See the [Table](manual/table.html) manual page for further details.

### escape(name)

Used to escape a name according to the conventions of the current
database client.

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
