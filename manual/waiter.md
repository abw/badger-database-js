# Waiter

When you're at a restaurant it would be a bit tedious if you asked the waiter
to bring you a steak (or vegetarian/vegan alternative if that's your thing),
and then when he delivered it to your table, you asked him for some potatoes,
and then when those came you asked him for some green beans, then some bread,
butter, a bottle of wine, and so on.  Each time you wait for one item to arrive
before you order the next.

The better approach, of course, would be to place your entire order at once
and then wait for the waiter to bring it.

Writing asynchronous Javascript code can feel a bit like the first scenario
sometimes.  For example, suppose we've got a music database and we want to load
the artist record for "The Pink Floyd" (as they were sometimes know in the early
days) and change the name to just "Pink Floyd".

The code might look something like this:

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

// wait for the artists table
const artists = await musicdb.model.artists;

// wait to fetch a record
const artist = await artists.oneRecord({
  name: 'The Pink Floyd'
});

// wait to update the record
await artist.update({
  name: 'Pink Floyd'
});

// fetch the new artist name
const name = artist.name;

// check we got the expected value
console.log(name);    // Pink Floyd
```

The database object that is returned from the `connect()` method includes a `waiter`
property that allows you to "place your entire order at once" and then wait for the result.

```js
const musicdb = connect({
  // as before
});
const name = await musicdb.
  .waiter       // waiter, please can you fetch...
  .model        // ...the database model...
  .artists      // ...which has an artists table...
  .oneRecord({  // ...containing a record...
    name: 'The Pink Floyd'
  })
  .update({     // ...that we want to update...
    name: 'Pink Floyd'
  })
  .name;        // ...then tell me the new name...

console.log(name);   //Pink Floyd
```

That's all there is to it.  The `waiter` property contains a
[proxymise](https://github.com/kozhevnikov/proxymise) wrapper
around the database.  This allows you to chain together asynchronous
method calls and access data properties in a convenient short-hand
form.  You just need to `await` the final result.