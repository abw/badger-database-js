# Table

This is a wrapper around a database table.

* [Overview](#overview)
* [Configuration](#configuration)
  * [table](#table)
  * [columns](#columns)
  * [virtualColumns](#virtualcolumns)
  * [columnSets](#columnsets)
  * [id](#id)
  * [keys](#keys)
  * [queries](#queries)
  * [fragments](#fragments)
  * [tableClass](#tableclass)
  * [recordClass](#recordclass)
* [Methods](#methods)
  * [knex()](#knex--)
  * [raw()](#raw--)
  * [query(name)](#query-name-)
  * [insert(data)](#insert-data-)
  * [insertRow(data)](#insertrow-data-)
  * [insertRows(data)](#insertrows-data-)
  * [selectRow(columns)](#selectrow-columns-)
  * [selectRows(columns)](#selectrows-columns-)
  * [fetchRow(where)](#fetchrow-where-)
  * [fetchRows(where)](#fetchrows-where-)
  * [update(set,where)](#update-set-where-)
  * [record(query)](#record-query-)
  * [records(query)](#records-query-)
* [Functions](#functions)
  * [table(database,schema)](#table-database-schema-)

## Overview

Conceptually we think of a table as being a collection of records.  I prefer to use
plural names (e.g. `users` and `companies` instead of `user` and `company`) in
keeping with that paradigm, but you can use any names you like.

The names of the tables you define for your application don't have to match the names
of the underlying database table.

## Configuration

Tables are defined via the `tables` item in a database configuration.

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

You can then access a table object using the `table()` method.

```js
const users = database.table('users');
```

The configuration items for a table are as follows.

### table

The default behaviour is to assume that the name of the underlying database table
is the same as the collection name.  If it isn't then you can use the `table`
configuration option to define it.

For example, if you want to define a collection of `users` in your application but the
underlying table name is `user` then you can define it like so:

```js
const database = new Database(
  // ...client, connection, pool, etc...
  tables: {
    users: {
      table: 'user'
    },
  }
)
```

### columns

The `columns` configuration item is used to define the columns that you want the
collection to have access to.  You don't have to include all of the columns in the
database table if you don't want to.

In the simplest case you can define the columns as a string of whitespace delimited
names.

```js
const database = new Database(
  // ...client, connection, pool, etc...
  tables: {
    users: {
      columns: 'id name email'
    },
  }
)
```

This is shorthand for specifying them as an array, which you can do if you prefer
or already have the column names in an array.

```js
const database = new Database(
  // ...client, connection, pool, etc...
  tables: {
    users: {
      columns: ['id', 'name', 'email']
    },
  }
)
```

The third option is to use a hash object to define the columns.  This allows you to
provide additional metadata about the columns.  You can add any metadata you like.
At the time of writing the metadata isn't used internally, but it might be soon.

```js
const database = new Database(
  // ...client, connection, pool, etc...
  tables: {
    users: {
      columns: {
        id: {
          type: 'id',
          automatic: true,
        },
        name: {
          type: 'text',
          required: true,
        },
        email: {
          type: 'text',
          required: true,
        }
      }
    },
  }
)
```

#### column metadata

TODO: add information about column metadata as and when we start to use it.

### virtualColumns

Any computed columns can be specified as `virtualColumns`.  For example, if you
have a user table with separate `forename` and `surname` columns then you might
want to add a virtual column that concatenates them to create a `name`.

In MySQL the `CONCAT()` function can be used.

```js
const database = new Database(
  // ...client, connection, pool, etc...
  tables: {
    users: {
      columns: 'id forename surname email',
      virtualColumns: {
        name: "CONCAT(users.forename, ' ', users.surname)"
      }
    },
  }
)
```

In sqlite the `||` operator is used for concatenation so the `name`
virtual column would be defined like this:

```js
virtualColumns: {
  name: "users.forename || ' ' || users.surname"
}
```

Note that it is considered good practice to specify the table and column
name in these cases, e.g. `users.forename` instead of just `forename`.
This will save any ambiguity when you're constructing queries that might
join onto other tables.  You might also want to escape the table and/or
column names if either are reserved words.

For example, MySQL uses the backtick character to escape names.

```js
virtualColumns: {
  name: "CONCAT(`users`.`forename`, ' ', `users`.`surname`)"
}
```

### columnSets

You can define set of columns that provide a shorthand way of referencing
commonly used subsets of columns.  By default, queries will use all of the
`columns` defined.  Any `virtualColumns` will not be included.

You can define a `default` column set to indicate which columns should be
included in queries by default.  For example, in our `users` table we might
want to exclude the `password` and `is_admin` columns, but include the `name`
virtual column.

```js
users = {
  columns: 'id forename surname email password is_admin',
  virtualColumns: {
    name: "CONCAT(users.forename, ' ', users.surname)"
  },
  columnSets: {
    default: 'id forename surname name email',
  }
};
```

The columns in a column set can be specified as a string of whitespace delimited column
names as shown above.  This is shorthand for an array of column names:

```js
columnSets: {
  default: ['id', 'forename', 'surname', 'name', 'email'],
}
```

The more explicit form is to define an object containing `include` and/or `exclude`
columns.  These operations are performed on the list of `columns`, so `include` can be
used to add in virtual columns or `exclude` can be used to exclude regular columns
that you don't want returned by default.

```js
columnSets: {
  default: {
    include: 'name',
    exclude: 'password is_admin'
  },
}
```

You can define any of your own named column sets in the same way.

```js
columnSets: {
  // id forename surname email name
  default: {
    include: 'name',
    exclude: 'password is_admin'
  },
  // id forename surname email password is_admin name
  admin: {
    include: 'name',
  },
  // name email
  basic: 'name email',
};
```

### id

The `id` configuration item can be used to name the column that is the
unique identifier for a row.  If you don't specify either `id` or `keys`
then it will default to `id`.

For example, if the `users` table uses the `user_id` column as the unique
identifier then you should specify it like so:

```js
users: {
  columns: 'user_id forename surname email',
  id: 'user_id'
}
```

### keys

In some cases you might have a table with a compound key composed from multiple
columns instead of a single `id` column.  For example, an `employees` table might
have a compound key formed from the `user_id` and `company_id` columns.

```js
employees: {
  columns: 'user_id company_id job_title start_date end_date',
  keys: 'user_id company_id'
}
```

### queries

Used to define named SQL queries that you can then run by calling the
[query(name)](#query-name-) method specifying the name of the query.

See the [database queries option](manual/database.html#queries) for examples
and the [Queries](manual/queries.html) manual page for further information.

### fragments

Use to define commonly used SQL fragments that can be interpolated into
named [queries](#queries).

In additional to any user-supplied [fragments](#fragments), a number of
additional fragments specific to the table will also be defined.  These
will all be pre-escaped according to the database client in use.  For
example, when using sqlite3, a table column of `albums.id` will be escaped
as `"albums"."id"` whereas for MySQL it will be escaped with backticks
instead of double quote characters.

* `table` - the table name, e.g. `"albums"`
* `columns` - a comma separated list of all table column names,
e.g. `"id", "title", "year"`
* `tcolumns` - a comma separated list of all column names prefixed with
the table name, e.g. `"albums"."id", "albums"."title", "albums"."year"`

In additional any [virtualColumns](#virtualcolumns) are included in the
fragments.  For example, consider a [virtualColumn](#virtualcolumns) defined
like this:

```js
virtualColumns: {
  titleYear:    'title || " (" || year || ")"',
}
```

It can be embedded in SQL queries as `<titleYear>` and will expand
to `title || " (" || year || ")" as titleYear`.

Note that you are responsible for escaping any table names or columns that
might be reserved words in your [virtualColumns](#virtualcolumns) and
[fragments](#fragments).

See the [database fragments option](manual/database.html#queries) for examples
and the [Queries](manual/queries.html) manual page for further information.

### tableClass

You can create your own subclass of the `Table` module and define your own
methods for queries on the table.

Here's a simple `Users` class which implements a `badgers()` method to
fetch all rows where the surname is `Badger`.

```js
export class Users extends Table {
  badgers() {
    return this.fetchRows({ surname: "Badger" });
  }
}
```

Then in the schema for the `users` class, define the `Users` class as the
`tableClass` configuration item.

```js
const database = new Database(
  // ...client, connection, pool, etc...
  tables: {
    users: {
      tableClass: Users
    },
  }
)
```

Now you can call the `badgers()` method on the table object for the `users` table.

```js
const badgers = await database.table('users').badgers()
```

### recordClass

Various table methods have the option to convert rows returned from the database into
record objects.  This provides a simple implementation of the Active Record pattern.

The default [Record](manual/record.html) class provides basic functionality to update
the record, delete it, access related records, and so on.

You can also define your own record subclass for a table in which you can provide
additional methods or wrap the default methods to implement additional business logic,
data validation, logging, etc.  In this case you should use the `recordClass` configuration
option to provide a reference to your custom record class.

This simple example shows how a custom `User` record class can be defined which adds a
`hello()` method.

```js
import { Database, Record } from  "@abw/badger-database";

// define User subclass of Record
class User extends Record {
  hello() {
    return `Hello ${this.forename} ${this.surname}`;
  }
}

// create database connection with users table
const database = new Database(
  // ...client, connection, pool, etc...
  tables: {
    users: {
      columns: 'id forename surname',
      recordClass: User,
    },
  }
)

// insert row and convert returned data to a User record
const bobby = await database.table('users').insert({
  forename: 'Bobby',
  surname: 'Badger',
}).record()

console.log(bobby.hello())    // Hello Bobby Badger
```

## Methods

### knex()

Returns a Knex query with the table name pre-defined.

```js
const badger =
  await users
    .knex()
    .select('forename')
    .where({ email: "bobby@badgerpower.com" })
    .first();
```

### raw()

Used to generate a raw SQL query for the database.  Equivalent to calling
`knex.raw()`.

### query(name)

This method allows you to execute a named query that was previously
defined using the [queries](#queries) configuration option.

Given this database definition:

```js
const database = new Database(
  // ...client, connection, pool, etc...
  tables: {
    albums: {
      columns: 'id title'
      queries: {
        albumsByNumberOfTracks:
          'SELECT albums.title, COUNT(tracks.id) as n_tracks ' +
          'FROM albums ' +
          'JOIN tracks ' +
          'ON tracks.album_id=albums.id ' +
          'GROUP BY albums.id ' +
          'ORDER BY n_tracks ',
      }
    },
    tracks: {
      columns: 'id title album_id'
    }
  }
)
```

You can then run the `albumsByNumberOfTracks` query like so:

```js
const albums = await database
  .table('albums')
  .query('albumsByNumberOfTracks');
```

You can embed [fragments](#fragments) in your queries inside angle brackets.

If the `name` passed to the `query()` method is a single word then it is
assumed to be a pre-defined named query (and an error will be throw if it
doesn't exist).  Otherwise it is assumed to be a raw SQL query.  The query
can also include embedded fragments, including those that are auto-generated
such as `table` for the table name and `columns` for the table columns.

```js
const albums = await database
  .table('albums')
  .query('SELECT &lt;columns&gt; FROM &lt;table&gt; ORDER BY year,id');
```

### insert(data)

Insert data into the table.  You can pass a single object row or an array of
rows to insert.  This method will then delegate to [insertRow()](#insertrow-data-)
or [insertRows()](#insertrows-data-) as appropriate

Single row:

```js
const bobby = await users.insert({
  forename: 'Bobby',
  surname: 'Badger',
  email: 'bobby@badgerpower.com',
  is_admin: 1,
})
```

Multiple rows:

```js
const badgers = await users.insert([
  {
    forename: 'Bobby',
    surname: 'Badger',
    email: 'bobby@badgerpower.com',
    is_admin: 1,
  },
  {
    forename: 'Brian',
    surname: 'Badger',
    email: 'brian@badgerpower.com',
    is_admin: 0,
  },
  {
    forename: 'Simon',
    surname: 'Stoat',
    email: 'simon@stoat.com',
  }
]);
```

### insertRow(data)

This inserts a single row into the database and then fetches the row back
out again.  Note that this is different to the [insert() method](https://knexjs.org/guide/query-builder.html#insert)
provided by Knex.js which only returns the ID of the inserted record.

```js
const bobby = await users.insertRow({
  forename: 'Bobby',
  surname: 'Badger',
  email: 'bobby@badgerpower.com',
  is_admin: 1,
})
```

One benefit of this approach is in situations where you want to insert a row and then do
something with the inserted data, e.g. return it via an API response.  By fetching the
record after it has been inserted we guarantee that any automatically created column
values are included.  For example, this would include any generated ID value, and also
any columns that have default values, e.g. a `created` column that defaults to have the
current timestamp.

Another feature is that the value returned from the `insertRow()` method is a proxy which
intercepts the `record()` method call and converts the raw row data to a record object.

```js
const bobby = await users.insertRow({
  forename: 'Bobby',
  surname: 'Badger',
  email: 'bobby@badgerpower.com',
  is_admin: 1,
}).record()   // convert to record object
```

The downside is that you're performing two database queries (an insert and a select) instead
of one.  If you don't want or need this functionality then you can use the underlying
Knex.js `insert()` method instead.

### insertRows(data)

This inserts multiple row into the database and then fetches the rows back
out again, as per [insertRow()](#insertrow-data-).

```js
const badgers = await users.insertRows([
  {
    forename: 'Bobby',
    surname: 'Badger',
    email: 'bobby@badgerpower.com',
    is_admin: 1,
  },
  {
    forename: 'Brian',
    surname: 'Badger',
    email: 'brian@badgerpower.com',
    is_admin: 0,
  },
  {
    forename: 'Simon',
    surname: 'Stoat',
    email: 'simon@stoat.com',
  }
]);
```

The method returns an array of inerted row.  You can call the `records()` method to
convert them to [Record](manual/record.html) objects.

### selectRow(columns)

Returns a select query to fetch a single row.  The optional `columns` argument
can be used to specify the columns or column sets you want to select.  Otherwise
the default column set will be used.

The method returns a proxy around the Knex query.  You can call additional Knex
methods on it.

```js
const row = await table.selectRow().where({ animal: "badger" });
```

You can also call the `record()` method to convert
the row data to a [Record](manual/record.html) object.

```js
const row = await table.selectRow();
const row = await table.selectRow("column1 column2 ...columnset");
const row = await table.selectRow().where({ email: "bobby@badgerpower.com" });
const rec = await table.selectRow().where({ email: "bobby@badgerpower.com" }).record();
```

### selectRows(columns)

Returns a select query.  The optional `columns` argument can be used to
specify the [columns](#columns) or [columnSets](#columnsets) you want to select.
Otherwise the default column set will be used.

To include the columns named in a column set, include the name of the column
set prefixed by `...`, e.g. `...admin` to include the columns defined in the
`admin` column set.

```js
const rows = await table.selectRows();
const rows = await table.selectRows("name email ...admin");
```

The method returns a proxy around the Knex query.  You can call additional Knex
methods on it.

```js
const rows = await table.selectRows().where({ animal: "badger" });
```

You can also call the `records()` method to convert the data rows to
[Record](manual/record.html) objects.

```js
const records = await table.selectRows().where({ animal: "badger" }).records();
```

### fetchRow(where)

Returns a select query that fetches a single record with the default columns
selected.  The optional `where` argument can be used to provide additional
constraints.  This is shorthand for chaining a `where()` method.

You can also chain the `record()` method to convert the data row to a
[Record](manual/record.html) object.

```js
const row = await table.fetchRow();
const row = await table.fetchRow({ animal: "badger" });
const rec = await table.fetchRow({ animal: "badger" }).record();
```

### fetchRows(where)

Returns a select query with the default columns selected.  The optional
`where` argument can be used to provide additional constraints.  This is
shorthand for chaining a `where()` method.

You can also chain the `records()` method to convert the data rows to
[Record](manual/record.html) objects.

```js
const rows = await table.fetchRows();
const rows = await table.fetchRows({ animal: "badger" });
const recs = await table.fetchRows({ animal: "badger" }).records();
```

### update(set,where)

This method can be used to update one or more rows in the database.
The first argument is an object defining updates to be set in the rows.
The second argument is an object providing the criteria to match rows.

For example, this call will set the `is_admin` column to `1` for all rows
where the `surname` is `Badger`.

```js
await users.update({ is_admin: 1 }, { surname: 'Badger' });
```

The `update()` method works like the [insertRows()](#insertrows-data-) method
in that it will perform two queries: the first to apply the changes and the second
to re-fetch all the matching rows from the database.

```js
const badgers = await users.update({ is_admin: 1 }, { surname: 'Badger' });
```

This ensures that the data returned will include any columns that are updated
by the database.  For example, you might have a `modified` column which is
automatically updated when the record is modified.  In MySQL that column
would be defined something like this:

```sql
modified TIMESTAMP NOT NULL
         DEFAULT CURRENT_TIMESTAMP
         ON UPDATE CURRENT_TIMESTAMP
```

When you call the `update()` method the rows will contain the `modified` data
items reflecting the new values set in the database table rows.

The rows that are returned by the `update()` method can be converted to records
by chaining the `records()` method.

```js
const badgers = await users.update({ is_admin: 1 }, { surname: 'Badger' }).records();
```

If you don't want this behaviour and just want to update the rows without re-fetching
them, then you can "roll your own" update using the Knex query returned by the
[knex()](#knex--) method.

```js
await users.knex().update({ is_admin: 1 }).where({ surname: 'Badger' });
```

### record(query)

Method to create a record object from a single row returned by a query.
This is called automagically by appending a `.record()` method to the
end of a query returned by `selectRow()` or `fetchRow()`.

```js
const badger = await table.fetchRow({ animal: "badger" }).record();
```

### records(query)

Method to create record objects from all rows returned by a query.
This is called automagically by appending a `.records()` method to the
end of a query returned by `selectRows()`, `fetchRows()` or `update()`.

```js
const badgers = await table.fetchRows({ animal: "badger" }).records();
```

## Functions

### table(database,schema)

A function of convenience which wraps a call to `new Table()`.

```js
import { table } from '@abw/badger-database';
const tab = table(...);
```

This is equivalent to:

```js
import { Table } from '@abw/badger-database';
const tab = new Table(...);
```
