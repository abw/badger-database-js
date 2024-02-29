# Errors

In an ideal world every SQL query you write would be syntactically correct,
run first time, return the correct results and be efficient to boot.
Unfortunately we don't live in an ideal world.  I've been writing SQL in a
professional capacity for longer than I care to remember (3 decades or so)
and I *very rarely* get a complex query right first time.

This is one reason why I'm not a fan of using ORMs or query builders for more
complex queries.  I *nearly always* write, test and debug a complex query in SQL
first.  When it's finally working as expecting I don't want to then have to
translate it into a format that the ORM or query builder will understand and
hope that it generates the same SQL that I've written.  Your experience may
be different, of course, but it's the principle that has guided me in the
design and implementation of this library.

Databases aren't well known for producing friendly error messages when
something goes wrong (I'm looking at *all* of you, Sqlite, Mysql and Postgres).
The database engine modules that handle the specifics of different databases
try to make the process of debugging SQL queries a little less painful.  If
there is a parse error in a SQL query then they will throw a `SQLParseError`
and do their best to standardise the response.

Most importantly, the error will contain a copy of the SQL query that failed
so that you don't have to go digging around to find it (this is particularly
useful when the query has been generated programmatically by a query builder).

Here's a trivial example showing an invalid SQL query.

```js
async function main() {
  const db = connect({
    database: 'sqlite:memory',
  })
  await db.run(
    `SELECT FROM badger mushroom`
  ).catch(
    e => console.log(e)
  )
  db.disconnect();
}
main()
```

Sqlite is perhaps the database that provides the least friendly error messages.
It will look something like this:

```js
SQLParseError: near "FROM": syntax error
    at Database.prepare (...blah...)
    at SqliteEngine.prepare (...blah...)
    at SqliteEngine.execute (...blah...)
    at async main (...blah...) {
  name: 'SQLParseError',
  query: 'SELECT FROM badger mushroom',
  type: 'SQLITE_ERROR',
  code: undefined,
  position: undefined
}
```

Here's an example of the same error when using Postgres:

```js
SQLParseError: relation "badger" does not exist
    at PostgresEngine.parseError (...blah...)
    at ...blah...
    at processTicksAndRejections (...blah...)
    at async PostgresEngine.execute (...blah...)
    at async main (...blah...) {
  query: 'SELECT FROM badger mushroom',
  type: 'ERROR',
  code: '42P01',
  position: '13'
}
```

And here it is for Mysql:

```js
SQLParseError: You have an error in your SQL syntax; check the manual that corresponds to
your MySQL server version for the right syntax to use near 'FROM badger mushroom' at line 1
    at PromiseConnection.prepare (...blah...)
    at MysqlEngine.prepare (...blah...)
    at MysqlEngine.execute (...blah...)
    at processTicksAndRejections (...blah...)
    at async main (...blah...) {
  query: 'SELECT FROM badger mushroom',
  type: 'ER_PARSE_ERROR',
  code: 1064,
  position: undefined
}
```