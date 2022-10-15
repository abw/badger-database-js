# Table Queries

You can define named queries and query fragments in your tables.
This allows you to scope queries more closely to the table that
they relate to, instead of piling everything into the main database
definition.

They work in exactly the same way as for
[named queries](manual/named_queries.html) defined on the database.
You can use static SQL queries, you can embed query fragments into
queries, or you can use the [query builder](manual/query_builder.html)
to generate the queries for you.

```js
const db = connect({
  database: 'sqlite://.db',
  tables: {
    users: {
      columns: 'id name email'
      queries: {
        selectByName:
          // SQL including table-specific fragments
          'SELECT &lt;columns&gt; FROM &lt;table&gt; WHERE name = ?',
        selectByEmail:
          // using a query builder
          t => t.select('id name email').from('users').where('email'),
        allBadgers:
          // using the .fetch query builder shortcut
          t => t.fetch.where({ animal: 'Badger' })
      }
    },
  }
});

// fetch the users table
const users = await db.table('users');

// calling named queries
const user1 = await users.one('selectByName', ['Bobby Badger']);
const user2 = await users.any('selectByEmail', ['brian@badgerpower.com']);
```

The table pre-defines two fragments for each table: `<table>` is the quoted
table name (e.g. `"users"`) and `<columns>` is a list of all the columns
in the table, scoped to the table name with both parts properly quoted
(e.g. `"users"."id", "users"."name", "users"."email").

This allows you to write more succinct named queries where you want to include
all the columns:

```js
// tables.users.queries...
selectByName:
  'SELECT &lt;columns&gt; FROM &lt;table&gt; WHERE name = ?',
```

To use the query builder define a named query as a function.  It will
receive a reference to the table object on which you can call `select()`
or `from()` to start a query.  Further query builder methods can then
be called on it.

```js
// tables.users.queries...
selectByEmail:
  t => t.select('id name email').from('users').where('email'),
```

If you want to start a query with a method other than `select()`
or `from()` for some reason then you must prefix it with `.build`.

```js
// tables.users.queries...
selectByEmail:
  t => t.build.where('email').select('id name email').from('users')
```

The table provides a `.fetch` shortcut which is a query
builder that has the table name and all columns pre-selected.

```js
// tables.users.queries...
selectByEmail:
  t => t.fetch.where('email')
  // -> SELECT "users"."id", "users"."name", "users"."email"
  //    FROM "users"
  //    WHERE "email" = ?
```


## selectOneRow(query, values, options)

There are three different methods for selecting rows from the table using
SQL queries or named queries.  The `selectOneRow()` method will return a single row.
If the row isn't found or multiple rows match the criteria then an
`UnexpectedRowCount` error will be thrown with a message of
the form `N rows were returned when one was expected`.

You can then call a named query by specifying the name as the
first argument, followed by an array of any placeholder values.

```js
// returns a single row or throws an error
const brian = await users.selectOneRow(
  'selectByName', ['Bobby Badger']
);
console.log('Brian:', brian);
```

You can can also use SQL query string in place of a named query.

```js
// returns a single row or throws an error
const brian = await users.selectOneRow(
  'SELECT * FROM users WHERE name = ?',
  ['Bobby Badger']
);
console.log('Brian:', brian);
```

You can pass a third argument which can contain the `record` option if you
want the data returned as a [record](manual/record.html) instead of a row.

```js
const brian = await users.selectOneRow(
  'selectByName', ['Bobby Badger'],
  { record: true }
);
```

The `selectRow()` method is provided as an alias to this method.

```js
const brian = await users.selectRow(
  'selectByName', ['Bobby Badger']
);
```

## selectAnyRow(query, values, options)

The `selectAnyRow()` method is like [selectOneRow()](#selectonerow-query--values--options-)
but will return a single row if it exists or `undefined` if it doesn't.

```js
// returns a single row or undefined
const brian = await users.selectAnyRow(
  'selectByName', ['Bobby Badger']
);
if (brian) {
  console.log('Brian:', brian);
}
else {
  console.log('Brian Badger was not found');
}
```

As per [selectOneRow()](#selectonerow-query--values--options-) you can pass an
additional object containing the `record` option to return the row as a record
object.

```js
const brian = await users.selectAnyRow(
  'selectByName', ['Bobby Badger']
  { record: true }
);
```

## selectAllRows(query, values, options)

The `selectAllRows()` method will return an array of all matching rows.

```js
// returns an array of all rows (possibly empty)
const bobbies = await users.selectAllRows(
  'selectByName', ['Bobby Badger']
);
if (bobbies.length) {
  console.log("Fetched %s users called 'Bobby Badger':", bobbies.length);
}
else {
  console.log("There aren't any users called 'Bobby Badger'");
}
```

The `selectRows()` method is provided as an alias to this method.

```js
const bobbies = await users.selectRows(
  'selectByName', ['Bobby Badger']
);
```

## selectOneRecord(query, values, options)

This method is a wrapper around [selectOneRow()](#selectonerow-query--values--options-) which returns
the row as a record object.  It effectively sets the `record` option for you.

Read more about records [here](manual/records.html).

## selectAnyRecord(query, values, options)

This method is a wrapper around [selectAnyRow()](#selectanyrow-query--values--options-) which returns
the row as a record object.

## selectAllRecords(query, values, options)

This method is a wrapper around [selectAllRows()](#selectallrows-query--values--options-) which returns
the rows as an array of record objects.

## oneRow(query, args)

This method is a multiplexer around
[selectOneRow()](#selectonerow-query--values--options-)
and
[fetchOneRow()](manual/table_methods#fetchonerow-where--options-).  If the first argument
is a string or query builder object then it calls `selectOneRow()`
otherwise it calls `fetchOneRow()`.

```js
// same as users.selectOneRow()
const row = await users.oneRow(
  'selectByName', ['Bobby Badger']
);
```

```js
// same as users.fetchOneRow()
const row = await users.oneRow(
  { name: 'Bobby Badger' }
);
```

## anyRow(query, args)

This method is a multiplexer around
[selectAnyRow()](#selectanyrow-query--values--options-)
and
[fetchAnyRow()](manual/table_methods#fetchanyrow-where--options-).  If the first argument
is a string or query builder object then it calls `selectAnyRow()`,
otherwise it calls `fetchAnyRow()`.

```js
// same as users.selectAnyRow()
const row = await users.anyRow(
  'selectByName', ['Bobby Badger']
);
```

```js
// same as users.fetchAnyRow()
const row = await users.anyRow(
  { name: 'Bobby Badger' }
);
```

## allRows(query, args)

This method is a multiplexer around
[selectAllRows()](#selectallrows-query--values--options-)
and
[fetchAllRows()](manual/table_methods#fetchallrows-where--options-).  If the first argument
is a string or query builder object then it calls `selectAllRows()`,
otherwise it calls `fetchAllRows()`.

```js
// same as users.selectAllRows()
const rows = await users.allRows(
  'selectByName', ['Bobby Badger']
);
```

```js
// same as users.fetchAllRows()
const row = await users.allRows(
  { name: 'Bobby Badger' }
);
```

## oneRecord(query, args)

This method is a multiplexer around
[selectOneRecord()](#selectonerecord-query--values--options-)
and
[fetchOneRecord()](manual/table_methods#fetchonerecord-where--options-).  If the first argument
is a string or query builder object then it calls `selectOneRecord()`
otherwise it calls `fetchOneRecord()`.

```js
// same as users.selectOneRecord()
const row = await users.oneRecord(
  'selectByName', ['Bobby Badger']
);
```

```js
// same as users.fetchOneRecord()
const row = await users.oneRecord(
  { name: 'Bobby Badger' }
);
```

## anyRecord(query, args)

This method is a multiplexer around
[selectAnyRecord()](#selectanyrecord-query--values--options-)
and
[fetchAnyRecord()](manual/table_methods#fetchanyrecord-where--options-).  If the first argument
is a string or query builder object then it calls `selectAnyRecord()`,
otherwise it calls `fetchAnyRecord()`.

```js
// same as users.selectAnyRecord()
const row = await users.anyRecord(
  'selectByName', ['Bobby Badger']
);
```

```js
// same as users.fetchAnyRecord()
const row = await users.anyRecord(
  { name: 'Bobby Badger' }
);
```

## allRecords(query, args)

This method is a multiplexer around
[selectAllRecords()](#selectallrecords-query--values--options-)
and
[fetchAllRecords()](manual/table_methods#fetchallrecords-where--options-).  If the first argument
is a string or query builder object then it calls `selectAllRecords()`,
otherwise it calls `fetchAllRecords()`.

```js
// same as users.selectAllRecords()
const rows = await users.allRecords(
  'selectByName', ['Bobby Badger']
);
```

```js
// same as users.fetchAllRecords()
const row = await users.allRecords(
  { name: 'Bobby Badger' }
);
```

## run(query, values, options)

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

## one(query, values, options)

This is another low-level method for running an SQL query where you're
expecting to get exactly one row returned.  It's just like the
corresponding [one()](manual/basic_queries.html#one-query--values--options-)
database method, with the additional table-specific SQL fragments available, as
per [run()](#run-query--values--options-).

```js
const bobby = users.one(
  'SELECT &lt;columns&gt; FROM &lt;table&gt; WHERE name=?',
  ['Bobby Badger']
)
```

You can also run any pre-defined named `queries` or include query `fragments`
in the queries you run using this method.

## any(query, values, options)

This is yet another low-level method for running an SQL query, but where
you're expecting to get one row returned which may or may not exist.
It's just like the corresponding
[any()](manual/basic_queries.html#any-query--values--options-)
database method, with the additional table-specific SQL fragments available,
as per [run()](#run-query--values--options-).

```js
const bobby = users.any(
  'SELECT &lt;columns&gt; FROM &lt;table&gt; WHERE name=?',
  ['Bobby Badger']
)
```

Pre-defined named `queries` can also be run, or you can include query
`fragments` in the SQL.

## all(query, values, options)

The final low-level method for running an SQL query where you're expecting to
get multiple rows.  It's just like the corresponding
[all()](manual/basic_queries.html#all-query--values--options-)
database method, with the additional table-specific SQL fragments available, as
per [run()](#run-query--values--options-).

```js
const rows = users.all(
  'SELECT &lt;columns&gt; FROM &lt;table&gt;',
)
```

Unsurprisingly, this method also allows you to run pre-defined named
`queries` or embed query `fragments` in the SQL.

