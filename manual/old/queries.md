# Queries

The `Queries` object is use by the [Database](manual/database.html) and
[Table](manual/table.html) classes to store and retrieve named SQL queries.

* [Overview](#overview)
* [Configuration](#configuration)
  * [queries](#queries)
  * [fragments](#fragments)
* [Methods](#methods)
  * [query(name)](#query-name-)
  * [expandFragments(query)](#expandfragments-query-)
* [Functions](#functions)
  * [queries(schema)](#queries-schema-)

## Overview

When you create a database and/or tables in the database you can define
named queries using the [queries](#queries) configuration option.

This allows you to define your hand-written queries in one place and then
access them from your application code using their names.  This allows them
to be re-used and avoids the need to have raw SQL queries dotted around your
application code.

If you have fragments of SQL that are repeated in various queries then
you can define them using the [fragments](#fragments)
configuration option. You can then interpolate them into queries by embedding
them in angle brackets, e.g. `<fragmentName>`.

## Configuration

### queries

This example shows how named `queries` can be defined in the database.

```js
import Database from '@abw/badger-database'

const database = new Database(
  // ...client, connection, pool, etc...
  queries: {
    albumWithMostTracks:
      'SELECT albums.title, COUNT(tracks.id) as n_tracks ' +
      'FROM albums ' +
      'JOIN tracks ' +
      'ON tracks.album_id=albums.id ' +
      'ORDER BY n_tracks DESC ' +
      'LIMIT 1',
    albumsByNumberOfTracks:
      'SELECT albums.title, COUNT(tracks.id) as n_tracks ' +
      'FROM albums ' +
      'JOIN tracks ' +
      'ON tracks.album_id=albums.id ' +
      'GROUP BY albums.id ' +
      'ORDER BY n_tracks ',
    theBestAlbumEverRecorded:
      'SELECT * ' +
      'FROM albums ' +
      'WHERE title="The Dark Side of the Moon"'
  }
)
```

You can then execute a query by calling the [query(name)](manual/database.html#query-name-)

```js
const albums = await database.query('albumsByNumberOfTracks');
```

### fragments

This example shows how the repeated SQL fragment can be moved into the
`fragments` configuration option and then interpolated into `queries`.

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
      'ORDER BY n_tracks',
    albumWithMostTracks:
      '&lt;selectAlbumsWithTrackCount&gt; ' +
      'ORDER BY n_tracks DESC ' +
      'LIMIT 1',
  }
)
```

There is no change to how queries are executed:

```js
const albums = await database.query('albumsByNumberOfTracks');
```

## Methods

### query(name)

This is used to fetch and expand any fragments in a query.

The query can be identified by `name` as a query previously defined
in the [queries](#queries) configuration option.

Raw SQL queries can also be passed to the method.  If the `name` isn't
a single word then it is assumed to be an SQL query.  You can still use
any [fragments](#fragments) in the query and they will be expanded.

For example, a query to return the three albums with the most tracks
could be specified like this:

```js
const albums = await database.query(
  '&ltselectAlbumsWithTrackCount&gt; ' +
  'ORDER BY n_tracks DESC ',
  'LIMIT 3',
);
```

### expandFragments(query)

Internal method used to expand fragments in SQL queries.

## Functions

### queries(schema)

A function of convenience which wraps a call to `new Queries()`.

```js
import { queries } from '@abw/badger-database';
const qs = queries(...);
```

This is equivalent to:

```js
import { Queries } from '@abw/badger-database';
const qs = new Queries(...);
```
