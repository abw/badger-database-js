# Relations

Relations are, rather unsurprisingly, at the heart of relational databases.

To demonstrate the concepts we're going to use an overly simple schema for
a music database.  We'll assume that the database tables have already been
created and populated with some sample data.

One table will store the `artists`.

```sql
CREATE TABLE artists (
  id   SERIAL,
  name TEXT,
  PRIMARY KEY (id)
)
```

Another will store the albums that they release, including the `year` and `title`.
Note the `artist_id` which forms a relation to the artist that released the
album.  In this simple example we're going to assume that only one artist can
release an album.  This isn't the case in the real world if you consider things
like multi-artist collaborations and compilation albums, but we're just trying
to demonstrate the basic concepts here, not build the next Spotify.

```sql
CREATE TABLE albums (
  id        SERIAL,
  year      INTEGER,
  title     TEXT,
  artist_id INTEGER,
  PRIMARY KEY (id),
  FOREIGN KEY (artist_id) REFERENCES artists(id)
)
```

A third table will store the tracks on each album, include the track `title`,
the `album_id` linking it to the album that it appears on, and the `track_no`
to indicate it's position in the track listing for the album.  The `bonus`
column is a boolean value which defaults to false, which is used to indicate
"bonus tracks" that sometime appear on albums.

```sql
CREATE TABLE tracks (
  id        SERIAL,
  title     TEXT,
  album_id  INTEGER,
  track_no  INTEGER,
  bonus     BOOLEAN DEFAULT false,
  PRIMARY KEY (id),
  FOREIGN KEY (album_id) REFERENCES albums(id)
)
```

## Relation Types

This example demonstrates two basic relation types: the "many to one" relation
that exists between artists and albums, and the "one to many" relation that
exists between albums and track.

Each artist can release many albums.  But in this simple example we're assuming
that an albums can only be released by one artist.  Therefore this is a "many
to one" relation.

Each album can have many tracks, but each track can only appear on a single album.
Therefore this is a "one to many" relation.

These two relations are given the names `one` and `many`. The `one` relation implies
that there is exactly one related record, whereas `many` implies there can be multiple
relations, including zero.  If you have a relation that *may* have one related record
then you can use the `any` relation.

|Name|Shorthand|Description|
|-|-|-|
|one|`from -> table.to`|Exactly one related record|
|any|`from ~> table.to`|Maybe one related record|
|many|`from => table.to`|Any number of related records (including zero)|

## Defining Table Relations

The relations for each table should be added to the `tables` configuration
as the `relations` object.  This is what our main database configuration
should look like.

```js
const musicdb = connect({
  database: 'postgres://musicdb',
  tables: {
    artists: {
      columns: 'id name',
      relations: {
        albums: {
          type:  'many',
          from:  'id',
          to:    'artist_id',
          table: 'albums',
        }
      }
    },
    albums: {
      columns: 'id year title artist_id',
      relations: {
        artist: {
          type:   'one',
          from:   'artist_id',
          to:     'id',
          table:  'artists',
        },
        tracks: {
          type:   'many',
          from:   'id',
          to:     'album_id',
          table:  'tracks',
          order:  'track_no',
        }
      }
    }
    tracks: {
      columns: 'id title album_id track_no bonus',
      relations: {
        album: {
          type:   'one',
          from:   'album_id',
          to:     'id',
          table:  'albums',
        },
      }
    }
})
```

The `artists` table has an `albums` relation which can include many albums.
The relation goes from the `id` column on the `artists` table to the
`artist_id` column on the `albums` table.

```js
// tables.artists.relations...
albums: {
  type:  'many',
  from:  'id',
  to:    'artist_id',
  table: 'albums',
}
```

The `albums` table has two relations.  The `artist` relation is one
artist with the join going from the `artist_id` column on the `albums`
table to the `id` column on the `artists` table.  The `tracks` relation
is many tracks with the join going from the `id` column on the `tracks`
table to the `album_id` column on the `albums` table.  The tracks in
this relation should be ordered by the `track_no` column.

```js
// tables.albums.relations...
artist: {
  type:   'one',
  from:   'artist_id',
  to:     'id',
  table:  'artists',
},
tracks: {
  type:   'many',
  from:   'id',
  to:     'album_id',
  table:  'tracks',
  order:  'track_no',
}
```

The `tracks` table has a single relation for the `album` that it appears on.
The join goes from the `album_id` column on the `tracks` table to the `id`
column on the `albums` table.

```js
// tables.tracks.relations...
album: {
  type:   'one',
  from:   'album_id',
  to:     'id',
  table:  'albums',
},
```

## Fetching Relations

Let's assume we've got Pink Floyd defined as an artist, and their
seminal albums "The Dark Side of the Moon" and "Wish You Were Here"
have already been added to the database.

We can start by fetching an artist record for Pink Floyd.

```js
const artists = await musicdb.table('artists');
const artist = await artists.oneRecord({ name: 'Pink Floyd' });
```

The `relation()` method allows us to fetch all related records in
a relation.  The `albums` relation is defined as a `many` type, so
it returns an array of records from the `albums` table.

```js
const albums = await artist.relation('albums');
console.log(albums[0].title);   // The Dark Side of the Moon
console.log(albums[1].title);   // Wish You Were Here
```

The record proxy object allows you to simplify this.  If there's a
relation defined for a record then you can access it as a property
of the record.  Just remember that there's actually a method call
and database access going on behind the scenes so you have to `await`
the result.

```js
const albums = await artist.albums;
console.log(albums[0].title);   // The Dark Side of the Moon
console.log(albums[1].title);   // Wish You Were Here
```

We can take one of those albums and use the `artist` relation
to fetch the artist that recorded the album.

```js
const dsotm = albums[0];
const artist = await dsotm.artist;
console.log(artist.name);   // Pink Floyd
```

We can also fetch the tracks on the album.  They will be automatically
ordered by the `track_no` column.

```js
const tracks = await dsotm.tracks;
console.log(tracks[0].title);  // Speak to Me / Breathe
console.log(tracks[1].title);  // On the Run
console.log(tracks[2].title);  // Time
console.log(tracks[3].title);  // The Great Gig in the Sky
// ...etc...
```

And finally, we can go the other way and, for a given track,
we can fetch the album that it appears on.

```js
const time = tracks[2];
const album = await time.album;
console.log(album.title);   // The Dark Side of the Moon
```

## Additional Constraints

Additional constraints for a relation can be defined using the
`where` property.

For example, we might want to define the `tracks` relation
to only return tracks that aren't bonus tracks, and define a
new `bonus_tracks` relation for those that are.

```js
// tables.albums.relations...
tracks: {
  type:   'many',
  from:   'id',
  to:     'album_id',
  table:  'tracks',
  order:  'track_no',
  where:  { bonus: 0 }
},
bonus_tracks: {
  type:   'many',
  from:   'id',
  to:     'album_id',
  table:  'tracks',
  order:  'track_no',
  where:  { bonus: 1 }
}
```

If your copy of The Dark Side of the Moon has
"Us and Them (Richard Wright Demo)" and "Money (Roger Waters Demo)"
included as bonus tracks (you lucky thing!) then you could fetch them
like so.  Assuming, of course, that they're in the database and have
the `bonus` columns set to `true` (or `1` which databases treat as the
same thing).

```js
const bonus = await dsotm.bonus_tracks;
console.log(bonus[0].title);  // Us and Them (Richard Wright Demo)
console.log(bonus[1].title);  // Money (Roger Waters Demo)
```

## Shorthand Syntax for Defining Relations

If you've got a simple relation then you can define it as a string
using the shorthand syntax.  The general format for the `one` relation is:

```js
from -> table.to
```

For an `any` relation it uses a "squiggly arrow" instead.

```js
from ~> table.to
```

For a `many` relation it uses a "fat arrow".

```js
from => table.to
```


For example, the `album` relation defined for the `tracks` table looks
like this:

```js
// tables.tracks.relations...
album: {
  type:   'one',
  from:   'album_id',
  to:     'id',
  table:  'albums',
},
```

That can be shortened to:

```js
album: 'album_id -> albums.id'
```

Similarly, the `albums` relation for `artists` can be shortened from
this:

```js
// tables.artists.relations...
albums: {
  type:  'many',
  table: 'albums',
  from:  'id',
  to:    'artist_id',
}
```

To this:

```js
albums: 'id => albums.artist_id'
```

You can't specify an `order` or additional `where` constraints using this
syntax.  If you need to specify those then you can either use the fully
expanded form:

```js
// tables.artists.relations...
albums: {
  type:  'many',
  table: 'albums',
  from:  'id',
  to:    'artist_id',
  order: 'year',
}
```

Or you can define the shorthand form as the `relation` item and add `order` and/or `where`
as additional items.

```js
// tables.artists.relations...
albums: {
  relation: 'id => albums.artist_id',
  order:    'year',
}
```

## Custom Queries

If you want to define a more complex relation then you can provide your own
`load` function to take care of it.

For example, suppose we want to fetch all the album tracks for a particular
artist, ordered by the album year and then the track number.

We can define a custom query in the `queries` section of the `artists` table
definition to load the relevant rows:

```js
// tables.artists...
queries: {
  album_tracks: `
    SELECT    tracks.*, albums.title as album, albums.year
    FROM      albums
    JOIN      tracks
    ON        tracks.album_id=albums.id
    WHERE     albums.artist_id=$1
    ORDER BY  albums.year,tracks.track_no
  `
}
```

Then we can add an `album_tracks` relation in the `relations` section of the same
`artists` table that looks something like this:

```js
// tables.artists...
relations: {
  album_tracks: {
    load: async (record) => {
      const artists = record.table;
      const rows = await artists.all(
        'album_tracks',
        [record.row.id]
      )
      return artists.records(rows);
    }
  }
}
```

The `load` function is passed a reference to the current record (an artist
in this case).  Each record has a reference to the `table` object that it
came from.  Through that we can fetch all the relevant rows using the
`album_tracks` query, passing the current artist id as the value for the
placeholder variable.

You can return the `rows` as they are, but in this example we'll convert them
to records by calling the `records()` method on the table.  This ensures
they're returned as record object in case we want to perform any further
record-based operations on them.

Here's the complete definition for the `artists` table:

```js
// tables...
artists: {
  columns: 'id name',
  queries: {
    album_tracks: `
      SELECT    tracks.*, albums.title as album, albums.year
      FROM      albums
      JOIN      tracks
      ON        tracks.album_id=albums.id
      WHERE     albums.artist_id=$1
      ORDER BY  albums.year,tracks.track_no
    `
  },
  relations: {
    albums: 'id => albums.artist_id',
    album_tracks: {
      load: async (record) => {
        const artists = record.table;
        const rows = await artists.all(
          'album_tracks',
          [record.row.id]
        )
        return artists.records(rows);
      }
    }
  }
```

And here's how we can use it.

```js
const artists = await musicdb.table('artists');
const artist  = await artists.oneRecord({ name: 'Pink Floyd' });
const tracks  = await artist.album_tracks;

// we should now have all the tracks from The Dark Side of the Moon
// followed by all those from Wish You Were Here
console.log(tracks[0].album);  // The Dark Side of the Moon
console.log(tracks[0].year);   // 1973
console.log(tracks[0].title);  // Speak to Me / Breathe

console.log(tracks[1].album);  // The Dark Side of the Moon
console.log(tracks[1].year);   // 1973
console.log(tracks[1].title);  // On the Run

// ...etc...

console.log(tracks[13].album);  // Wish You Were Here
console.log(tracks[13].year);   // 1975
console.log(tracks[13].title);  // Shine On You Crazy Diamond (Parts I-V)
```

There are other ways to achieve a similar result.  For example, you could define
your own [record class](manual/record_class.html) for the artists table and add
an `albumTracks` method:

```js
export class Artist extends Record {
  async albumTracks() {
    const artists = this.table;
    const rows = await artists.all(
      'album_tracks',
      [this.row.id]
    )
    return artists.records(rows);
  }
}
```

The usage would be almost identical:

```js
const artists = await musicdb.table('artists');
const artist  = await artists.oneRecord({ name: 'Pink Floyd' });
const tracks  = await artist.albumTracks();
// ...as before
```

If you've already defined a record class for a table then this might be the
easier approach.  On the other hand, if you don't already have a record
class then it might be slightly easier to define a custom relation with a
`load` method to achieve the same effect.