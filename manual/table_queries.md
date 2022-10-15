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

## run(sql, values)

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

