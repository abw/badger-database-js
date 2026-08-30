# Typescript Conversion

August 2026

Work is underway to convert some of this project to Typescript.

There's a lot to love about Typescript, and a few things to hate too.
If you're starting a new project then it's definitely a good idea to start
out using Typescript.  If you've got an old Javascript project then the pain
involved in migrating it to Typescript may not be worth it.

## The Problem

The problem with this project in particular is that it was written to replace
a similar library written in Perl about 25 years ago.  I've still got web sites
and other projects using that Perl code.  It still works, but for those projects
that I'm still maintaining or actively developing, I'd much rather be doing it
in Typescript (or even Javascript) these days than in Perl.  So for some of
them at least, I've begun the gradual migration away from Perl to JS/TS.

One problem stems from the fact that Perl is very not type safe.  The original
Badger Database Perl library very wasn't type safe either.  Nor was the first
implementation of the JS port for that matter.

Converting it to Typescript is non-trivial.  The deeper problem comes from the
fact that databases store untyped data.  You can run a query which returns
data joined from a dozen different tables.  There is really no option in these
cases other than to manually define the type of the data returned.

Kysely and Drizzle have demonstrated that it's certainly possible to create
type-safe database interfaces, but they have their limitations.  They're
essentially query builders with a few bits of ORM functionality thrown in here
and there.  However, they tend to force you down a particular way of working
in order to maintain that type safety.  It's not a bad thing, per se, but after
spending 25ish years using Badger Database I've really come to appreciate its
flexibility.  I don't want to get stuck using a less useful tool just to get
the type safety that it offers.

Badger Database takes a much more pragmatic view of a what a useful database
abstraction tool should be.  That is, to provide the best bits of query
builders and ORMs, but also to make it easier to write and execute raw SQL
queries for the many times when that's the best thing to do.  It also proves
lots of "short cuts" that make like easier.  Alas, some of these go against
the fundamental nature of statically scoped type safety.

## The Solution

In keeping with the pragmatical nature of this project, the solution is a
similarly pragmatic one: to provide some degree of type safety where we can.

The obvious contender is to make the table methods type safe.  When you insert
a row, it should be possible to type check the parameters that you want to
insert.  You should only be able to specify values for columns that exist and
aren't read-only (e.g. generated IDs).  The current implementation already
performs robust type checking, but it happens at runtime.  It's better than
nothing, but I'd rather have my editor tell me that I've mis-typed a parameter
name instead of waiting for my code to throw an error.

So you might be thinking that if we can type check parameters at runtime,
then surely we should be able to do it at compile time too.  Well, that would
be nice, but the problem is that the "type" that gets checked at run time is
based on the database schema specification that's passed in to the database
constructor.

And remember I mentioned those short cuts that I find so useful?  Here's one
of them - the ability to specify a list of columns as a whitespace delimited
string:

```js
const db = connect({
  database: 'sqlite://test.db',
  tables: {
    users: {
      columns: 'id name email'
    }
  }
});
```

The solution that I've come up with is to use the same code that converts
the above database schema specification.  It turns it into an expanded version
which tells us about every table, every column in the table, including information
about which ones are read-only, required, etc.

We can use that to pre-generate a set of types for each of the main actions
(`select`, `insert`, `update` and `delete`) that we can perform on each table
in the database.

There's an example of this in `./hacks/typegen.ts`.

The database schema is what we pass into the `connect()` method (along with
various other connection parameters which we'll skip over for now).
Given a database schema specification like this:

```js
const databaseSchema = {
  name: 'music',          // QUICK HACK - work to be done on this
  tables: {
    artists: {
      // short form
      columns: 'id:fixed:type=number name:required:type=string label:type=string volume:type=number'
    },
    albums: {
      // long form:
      columns: {
        album_id: {
          id: true,
          readonly: true,
          type: 'number',
        },
        artist_id: {
          required: true,
          type: 'number',
        },
        name: 'required',
        year: { },
      }
    }
  }
}
```

We can generate a set of types like this:

```ts
//==========================================================================
// WARNING:
//   These types are generated automatically from the database schema.
//   Any changes you make here may be lost.
//==========================================================================

//---------------------------------------------------------------------------
// Table: artists
//---------------------------------------------------------------------------
export type ArtistsTableInsertColumns = {
  id?: number
  name: string
  label?: string
  volume?: number
}
export type ArtistsTableUpdateColumns = {
  name?: string
  label?: string
  volume?: number
}
export type ArtistsTableSelectColumns = {
  id?: number
  name?: string
  label?: string
  volume?: number
}
export type ArtistsTableDeleteColumns = {
  id: number
}
export type ArtistsTableRowColumns = {
  id?: number
  name: string
  label?: string
  volume?: number
}
export type ArtistsTable = {
  insert: ArtistsTableInsertColumns
  update: ArtistsTableUpdateColumns
  select: ArtistsTableSelectColumns
  delete: ArtistsTableDeleteColumns
  row:    ArtistsTableRowColumns
}

//---------------------------------------------------------------------------
// Table: albums
//---------------------------------------------------------------------------
export type AlbumsTableInsertColumns = {
  artist_id: number
  name: string
  year?: string
}
export type AlbumsTableUpdateColumns = {
  artist_id?: number
  name?: string
  year?: string
}
export type AlbumsTableSelectColumns = {
  album_id?: number
  artist_id?: number
  name?: string
  year?: string
}
export type AlbumsTableDeleteColumns = {
  album_id: number
}
export type AlbumsTableRowColumns = {
  album_id?: number
  artist_id: number
  name: string
  year?: string
}
export type AlbumsTable = {
  insert: AlbumsTableInsertColumns
  update: AlbumsTableUpdateColumns
  select: AlbumsTableSelectColumns
  delete: AlbumsTableDeleteColumns
  row:    AlbumsTableRowColumns
}

//---------------------------------------------------------------------------
// Database
//---------------------------------------------------------------------------
export interface MusicDatabase {
  tables: {
    artists: ArtistsTable
    albums: AlbumsTable
  }
}
```

Save that in a file somewhere and then you can import it and use it as a
generic type parameter when connecting to the database.

(note: you can't do this just yet... it's still a work in progress)

```ts
import connect from '@abw/badger-database'
import { MusicDatabase } from 'MusicDatabaseTypes.ts'

// This is where we apply the MusicDatabase type to our generic database
const db = database<MusicDatabase>()
const db = connect<MusicDatabase>({
  database: {
    // db connection parameters,
  },
  // our table definitions from above
  tables: databaseSchema.tables,
})

// The table names are now strictly typed, in this case to `artists` and `albums`
const artists = db.table('artists')

// Each of the methods now has typed arguments (of a form).  The parameters
// passed to each method must meet the required type.  For example, you
// can't include properties in the first argument to insert() for columns that
// don't exists or a read only.  You can't update columns via update() if they're
// read only.  You must specify the 'id' identifier column for the delete() method.
const response1 = await artists.insert({ id: 11, name: 'Spinal Tap', volume: 11 })
const response2 = await artists.update({ name: 'Spin̈al Tap' }, { id: 11 })
const response3 = await artists.select({ id: 11 })
const response4 = await artists.select({ volume: 11 })
const response5 = await artists.delete({ id: 11 })
```

### Work in Progress

Like I already said, this is a work in progress.

The type generator is now working (see [hacks/typegen.ts]) and the
[hacks/tstest.ts] file demonstrates the principle of being able to pass
that type definition for the database down into table modules and methods.

The next step is to apply that typing to the main body of code and see if it
works.

Before we can do that, we need to clean up some of the types used to connect
to the database and get them to marry up with what's required to generate the
types.  It would be particularly useful if we can define a single database
schema that can be passed to both the `connect()` method and the type generator.

The connect code:

```ts
import { connect } from '@abw/badger-database'
import { myDbSchema } from 'database-schema.ts'
import type { MusicDatabase } from 'database-types.ts'

const db = connect<MusicDatabase>(myDbSchema);
```

The type generator code (pseudo-code - not necessarily working yet)

```ts
import { typegen } from '@abw/badger-database'
import { myDbSchema } from 'database-schema.ts'

await typegen(
  myDbSchema,
  {
    outputFile: 'database-types.ts'
  }
)
```

### Not Great, but Maybe Good Enough

Having to run a script to generate types isn't great.  Certainly not as great
as automatic type inference.  But I think it's a reasonable compromise.

If, like me, you define your database schema in YAML files, JSON files, or
something else, then it should be possible to watch those files for changes
and automatically re-run the type generating code.  Even if you have to
write a small TS script to load your schema definition and generate the types,
it should still be possible to watch the relevant source files and call it
automatically any time one of them changes.

And let's be honest, how often do we update database schemas anyway?  Yes,
quite often.  But when we do, that process normally involves migration scripts,
updating schema definition files and other things.  So having one additional
step that you have to run isn't all that bad.

