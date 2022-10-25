# Table Queries

* [SQL Queries](#sql-queries)
* [Named Queries](#named-queries)
* [Query Fragments](#query-fragments)
* [Query Builder](#query-builder)
* [Query Methods](#query-methods)
  * [run(query, values, options)](#run-query--values--options-)
  * [one(query, values, options)](#one-query--values--options-)
  * [any(query, values, options)](#any-query--values--options-)
  * [all(query, values, options)](#all-query--values--options-)
  * [oneRow(query, args)](#onerow-query--args-)
  * [anyRow(query, args)](#anyrow-query--args-)
  * [allRows(query, args)](#allrows-query--args-)
  * [oneRecord(query, args)](#onerecord-query--args-)
  * [anyRecord(query, args)](#anyrecord-query--args-)
  * [allRecords(query, args)](#allrecords-query--args-)
  * [sql(query)](#sql-query-)

## SQL Queries

Table objects implement the [run()](#run-query--values--options-),
[one()](#one-query--values--options-), [any()](#any-query--values--options-)
and [all()](#all-query--values--options-) method similar to those
defined on the main database for running [basic queries](manual/basic_queries.html).

```js
const user = await users.one(
  'SELECT "name" FROM "users" WHERE id = ?'
  [12345]
);
```

## Named Queries

You can define [named queries](manual/named_queries.html) in your
tables. This allows you to scope queries more closely to the table that
they relate to, instead of piling everything into the main database
definition.

```js
const db = connect({
  database: 'sqlite://users.db',
  tables: {
    users: {
      columns: 'id name email'
      queries: {
        selectNameById:
          'SELECT "name" FROM "users" WHERE id = ?'
      }
    },
  }
});
const users = await db.table('users')
const user = await users.one(
  'selectNameById'
  [12345]
);
```

## Query Fragments

You can define [query fragments](manual/query_fragments.html)
that can be embedded in your named queries or arbitrary SQL
queries.

```js
const db = connect({
  database: 'sqlite://users.db',
  tables: {
    users: {
      columns: 'id name email'
      fragments: {
        selectName:
          'SELECT "name" FROM "users"'
      }
      queries: {
        selectNameById:
          '&lt;selectName&gt; WHERE id = ?'
      }
    },
  }
});
const users = await db.table('users')

// named query with embedded fragments
const user1 = await users.one(
  'selectNameById'
  [12345]
);

// embed fragments directly into SQL query
const user2 = await users.one(
  '&lt;selectName&gt; WHERE email = ?'
  ['bobby@badgerpower.com']
);
```

The table pre-defines two fragments for each table: `<table>` is the quoted
table name (e.g. `"users"`) and `<columns>` is a list of all the columns
in the table, scoped to the table name with both parts properly quoted
(e.g. `"users"."id", "users"."name", "users"."email"`).

This allows you to write more succinct named queries where you want to include
all the columns:

```js
const db = connect({
  database: 'sqlite://users.db',
  tables: {
    users: {
      columns: 'id name email'
      queries: {
        selectById:
          'SELECT &lt;columns&gt; FROM &lt;table&gt; WHERE id = ?'
      }
    },
  }
});
const users = await db.table('users')

// named query with embedded fragments
const user1 = await users.one(
  'selectById'
  [12345]
);

// embed fragments directly into SQL query
const user2 = await users.one(
  'SELECT &lt;columns&gt; FROM &lt;table&gt; WHERE email = ?'
  ['bobby@badgerpower.com']
);
```

You can also use any named queries or query fragments defined in the database
configuration.  Queries defined in the database that include fragment references
will first try to resolve those fragments from the table definition before looking
for them in the database.

For example, that allows you to define a query or fragment in the database that
includes the `<columns>` or `<table>` fragments.  When the query is expanded it
will include the correct columns and table name for the table.

```js
const db = connect({
  database: 'sqlite://users.db',
  fragments: {
    allColumns: 'SELECT &lt;columns&gt; FROM &lt;table&gt;',
    byId:       'WHERE id = ?'
  },
  tables: {
    users: {
      columns: 'id name email'
      queries: {
        selectById:
          '&lt;allColumns&gt; &lt;byId&gt;'
      }
    },
  }
});
const users = await db.table('users')
console.log( users.sql('selectById') )
// -> SELECT "users"."id", "users"."name", "users"."email"
//    FROM "users"
//    WHERE id = ?
```

## Query Builder

You can use the [query builder](manual/query_builder.html) to generate
queries.  The `build` property contains a query builder node that you
can build queries on.

```js
const byEmail = users
  .build
  .select('id name')
  .from('users')
  .where('email')
// -> SELECT "id", "name"
//    FROM "users"
//    WHERE "email" = ?
const user = await byEmail.one(['bobby@badgerpower.com'])
```

The `select()` method is a short hand which automatically selects the current
table (i.e. it calls `from(table.name)`) for you.  You can specify the columns
that you want to select as arguments.

```js
const byEmail = users
  .select('id name')
  .where('email')
// -> SELECT "id", "name"
//    FROM "users"
//    WHERE "email" = ?
const user = await byEmail.one(['bobby@badgerpower.com'])
```

If you don't specify any columns to select then it will automatically select
all columns.

```js
const byEmail = users
  .select()
  .where('email')
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "email" = ?
const user = await byEmail.one(['bobby@badgerpower.com'])
```

You can pass a query constructed using the query builder as the first argument
to the [run()](#run-query--values--options-), [one()](#one-query--values--options-),
[any()](#any-query--values--options-) or [all()](#all-query--values--options-) methods.

```js
const user = await users.one(byEmail, ['bobby@badgerpower.com'])
```

You can use the query builder to generate named queries.  The query
should be defined as a function that will receive a reference to the
table object and should return the query builder chain.

```js
const db = connect({
  database: 'sqlite://users.db',
  tables: {
    users: {
      columns: 'id name email'
      queries: {
        selectByEmail:
          // using the query builder with a placeholder for email
          t => t.select().where('email'),
        allBadgers:
          // using the query builder with pre-defined values
          t => t.select().where({ animal: 'Badger' })
      }
    },
  }
});
const users = await db.table('users');
const user1 = await db.one(
  'selectByEmail',
  ['bobby@badgerpower.com']
);
const badgers = await db.all(
  'allBadgers'
);
```

## Query Methods

### run(query, values, options)

This is a low-level method for running a named query, or indeed
any arbitrary SQL query, where you're not expecting to fetch any rows.

It's just like the [run()](manual/basic_queries.html#run-query--values--options-)
method on the database object.  The only difference is that the table-specific
fragments for `<table>` and `<columns>` are pre-defined.
Any other `fragments` that you've specified in your table definition
will also be available.

As a trivial example, you can embed the `<table>` fragment in a query like this:

```js
users.run('DROP TABLE &lt;table&gt;')
```

Or you could define that as a named query called `drop` which you could run
like so:

```js
users.run('drop')
```

### one(query, values, options)

There are three different methods for selecting rows from the table using
SQL queries or named queries.  The `one()` method will return a single row.
If the row isn't found or multiple rows match the criteria then an
`UnexpectedRowCount` error will be thrown with a message of
the form `N rows were returned when one was expected`.

You can call a named query by specifying the name as the
first argument, followed by an array of any placeholder values.

```js
// returns a single row or throws an error
const bobby = await users.one(
  'selectByEmail', ['bobby@badgerpower.com']
);
```

You can also use a raw SQL query string in place of a named query.

```js
// returns a single row or throws an error
const bobby = await users.one(
  'SELECT * FROM users WHERE email = ?',
  ['bobby@badgerpower.com']
);
```

A SQL query can include references to query fragments.

```js
const bobby = await users.one(
  'SELECT &lt;columns&gt; FROM &lt;table&gt; WHERE email = ?',
  ['bobby@badgerpower.com']
);
```

You can pass a third argument which can contain the `record` option if you
want the data returned as a [record](manual/record.html) instead of a row.

```js
const brian = await users.one(
  'selectByEmail', ['bobby@badgerpower.com'],
  { record: true }
);
```

### any(query, values, options)

The `any()` method is like [one()](#one-query--values--options-)
but will return a single row if it exists or `undefined` if it doesn't.

```js
// returns a single row or undefined
const bobby = await users.any(
  'selectByEmail', ['bobby@badgerpower.com']
);
if (bobby) {
  console.log('Bobby:', bobby);
}
else {
  console.log('Bobby Badger was not found');
}
```

You can can use a SQL query string in place of a named query and this
can include query fragments.

```js
const bobby = await users.any(
  'SELECT &lt;columns&gt; FROM &lt;table&gt; WHERE email = ?',
  ['bobby@badgerpower.com']
);
```

You can also pass an additional object containing the `record` option to
return the row as a record object.

```js
const bobby = await users.any(
  'selectByEmail', ['bobby@badgerpower.com']
  { record: true }
);
```

### all(query, values, options)

The `all()` method will return an array of all matching rows.

```js
// returns an array of all rows (possibly empty)
const badgers = await users.all(
  'selectByEmail', ['bobby@badgerpower.com']
);
if (badgers.length) {
  console.log("Fetched %s Bobby Badger records':", badgers.length);
}
else {
  console.log("There aren't any badgers with that email address");
}
```

You can can use a SQL query string in place of a named query and this
can include query fragments.

```js
const badgers = await users.all(
  'SELECT &lt;columns&gt; FROM &lt;table&gt; WHERE animal=?',
  ['Badger']
);
if (badgers.length) {
  console.log("Fetched %s badgers':", badgers.length);
}
else {
  console.log("There aren't any badgers");
}

```

You can also pass an additional object containing the `record` option to
return the rows as an array of record objects.

```js
const brian = await users.all(
  'selectByEmail', ['bobby@badgerpower.com']
  { record: true }
);
```

### oneRow(query, args)

This method is a multiplexer around
[one()](#one-query--values--options-)
and
[fetchOne()](manual/table_methods#fetchone-where--options-).  If the first argument
is a string or query builder object then it calls `one()`
otherwise it calls `fetchOne()`.

```js
// same as users.one()
const row = await users.one(
  'selectByEmail', ['bobby@badgerpower.com']
);
```

```js
// same as users.fetchOne()
const row = await users.one(
  { email: 'bobby@badgerpower.com' }
);
```

### anyRow(query, args)

This method is a multiplexer around
[any()](#any-query--values--options-)
and
[fetchAny()](manual/table_methods#fetchany-where--options-).  If the first argument
is a string or query builder object then it calls `any()`,
otherwise it calls `fetchAny()`.

```js
// same as users.any()
const row = await users.anyRow(
  'selectByEmail', ['bobby@badgerpower.com']
);
```

```js
// same as users.fetchAny()
const row = await users.anyRow(
  { email: 'bobby@badgerpower.com' }
);
```

### allRows(query, args)

This method is a multiplexer around
[all()](#all-query--values--options-)
and
[fetchAll()](manual/table_methods#fetchall-where--options-).  If the first argument
is a string or query builder object then it calls `all()`,
otherwise it calls `fetchAll()`.

```js
// same as users.all()
const rows = await users.allRows(
  'selectByEmail', ['bobby@badgerpower.com']
);
```

```js
// same as users.fetchAll()
const row = await users.allRows(
  { email: 'bobby@badgerpower.com' }
);
```

### oneRecord(query, args)

This method is like [oneRow()](#onerow-query--args-) but returns the row as a record.

```js
// same as users.one() with the record option
const row = await users.oneRecord(
  'selectByEmail', ['bobby@badgerpower.com']
);
```

```js
// same as users.fetchOne() with the record option
const row = await users.oneRecord(
  { email: 'bobby@badgerpower.com' }
);
```

### anyRecord(query, args)

This method is like [anyRow()](#anyrow-query--args-) but returns the row as a record.

```js
// same as users.any() with the record option
const row = await users.anyRecord(
  'selectByEmail', ['bobby@badgerpower.com']
);
```

```js
// same as users.fetchAny() with the record options
const row = await users.anyRecord(
  { email: 'bobby@badgerpower.com' }
);
```

### allRecords(query, args)

This method is like [allRows()](#allrows-query--args-) but returns the rows as an
array of records.

```js
// same as users.all() with the record option
const rows = await users.allRecords(
  'selectByEmail', ['bobby@badgerpower.com']
);
```

```js
// same as users.fetchAll() with the record option
const row = await users.allRecords(
  { email: 'bobby@badgerpower.com' }
);
```


### sql(query)

This method can be used to view the expanded SQL of a named query or
raw SQL query with embedded fragment references.

```js
console.log( users.sql('allBadgers') )
// -> SELECT "users"."id", "users"."name", "users"."email", "users"."animal"
//    FROM "users"
//    WHERE "animal" = ?
```

## Where Next?

In the section we'll show how you can define your own
[table classes](manual/table_class.html) to help organise larger
projects and provide custom table functionality.
