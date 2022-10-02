# Model

This is a proxy around a database providing some syntactic
sugar for accessing database tables.

* [Overview](#overview)

## Overview

You can fetch tables from the database by calling the
[table(name)](manual/database.html#table-name-) method.

```js
const users = database.table('users');
```

The `database.model` is a proxy object that provides a
shorthand way to access tables.

```js
const users = database.model.users;
```

Admittedly you don't save much typing in this example, but
the `database.model` proxy also provides access to all of
the underlying `database` methods and properties.  So you can
safely pass around the `model` as an alias for the `database`
and benefit from having a shorthand way to access tables.

```js
myFunction(database.model);

function myFunction(model) {
  const albums  = model.albums;     // vs database.table('albums')
  const artists = model.artists;    // vs database.table('artists')
  const tracks  = model.tracks;     // vs database.table('tracks')
  // ...etc...
}
```

