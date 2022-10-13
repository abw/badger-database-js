# Model

The database `model` property provides a short-hand way to access tables
in the database model.

Given a database connection like this:

```js
// connect to the database
const musicdb = connect({
  database: 'sqlite:memory',
  tables: {
    artists: {
      columns: 'id name'
    },
    // ...etc...
  }
});
```

We can fetch the `artists` table by calling the `table()` method:

```js
const artists = await musicdb.table('artists');
```

The database `model` is a proxy that allows you to use the shorthand form.

```js
const artists = await musicdb.model.artists;
```

Admittedly it doesn't save you much typing, but I find it slightly
easier to read (and marginally easier to type).