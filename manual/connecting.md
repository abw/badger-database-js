# Connecting

The badger-database library uses an *Engine* to talk to the underlying database.
There are three provided: sqlite, mysql and postgres.

## Connection String

The simplest way to connect to a database is using a connection string for the
`engine` parameter. This is a concept that should be familiar to Postgres users.

```js
const mydb = await database({
  engine: 'postgresql://user:password@hostname:5432/database'
})
```

Internally we use the slightly shorter name of `postgres` (no `ql` at the end)
for the Postgres engine name.  To avoid any chance of confusion, we also support
this in the connection string and automatically "correct" it for you.

```js
const mydb = await database({
  // 'postgres://...' works the same as 'postgresql://...'
  engine: 'postgres://user:password@hostname:5432/database'
})
```

You can use the same connection string format for Mysql databases:

```js
const mydb = await database({
  engine: 'mysql://user:password@hostname:3306/database'
})
```

And also for Sqlite databases, although here the only parameter supported
is the database filename.

```js
const mydb = await database({
  engine: 'sqlite://database'
})
```

For an in-memory Sqlite database, use `:memory:` as the database name:

```js
const mydb = await database({
  engine: 'sqlite://:memory:'
})
```

Or if you find that a bit clunky, you can use the shortened version:

```js
const mydb = await database({
  engine: 'sqlite:memory'
})
```

Most of the elements are optional for Postgres and Mysql databases.
Here are the minimal versions which assume the default host (`localhost`),
port (`3306` for Mysql and `5432` for Postgres) and no username or password.

```js
const mydb = await database({
  engine: 'postgresql://database'
})
```

```js
const mydb = await database({
  engine: 'mysql://database'
})
```

## Connection Parameters

The connection strings shown in the previous sections are short-hand versions
for the more verbose form.  If your connection parameters are stored in a file,
loaded via an API call, or fetched in some other way then it may be more
convenient to use this form.

```js
const mydb = await database({
  // "postgres://badger:s3cr3t@dbhost.com:5433/animals" is short for:
  engine: {
    driver:   'postgres',   // or 'postgresql'
    user:     'badger',
    password: 's3cr3t',
    host:     'dbhost.com',
    port:     '5433',
    database: 'animals',
  }
})
```

The same configuration options apply to Mysql.  For Sqlite the only supported
option is `filename`.

```js
const mydb = await database({
  engine: {
    driver:   'sqlite',
    filename: 'animals.db',
  }
})
```

You can also use `:memory:` as the `filename` for an in-memory database.

```js
const mydb = await database({
  engine: {
    driver:   'sqlite',
    filename: ':memory:',
  }
})
```

## Connection Parameter Aliases

Whenever I'm writing the code to connect to a database there's a good chance I'll
get one of the parameter name wrong.  Is it `user` or `username`? `pass` or `password`?
`host` or `hostname`? `file` or `filename`?

Of course you could google it, but there's no need. You can specify any of the "incorrect"
parameters and we'll automatically fix them for you.

For example, if you specify `file` instead of `filename` for a Sqlite database, we'll
silently correct it.

```js
const mydb = await database({
  engine: {
    driver: 'sqlite',
    file:   'animals.db',   // converted to 'filename'
  }
})
```

This also just works:

```js
const mydb = await database({
  engine: {
    driver:   'postgres',
    database: 'animals',
    user:     'badger',
    pass:     's3cr3t',     // converted to 'password'
    host:     'dbhost.com',
    port:     '5433',
  }
})
```

And this works too:

```js
const mydb = await database({
  engine: {
    driver:   'postgres',
    database: 'animals',
    username: 'badger',     // converted to 'user'
    password: 's3cr3t',
    hostname: 'dbhost.com', // converted to 'host'
    port:     '5433',
  }
})
```

## Pool Options

The Postgres and Mysql database engines use a connection pool for efficiency.
By default, the minimum number of connections is 2 and the maximum is 10.  You
can change these values using the `pool` option.

```js
const mydb = await database({
  engine: { ... },
  pool: {
    min: 5,
    max: 20
  }
})
```

The Sqlite engine uses [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
which uses synchronous functions.  This is because Sqlite serialises all queries
and there is nothing to gain (and the potential for problems) by using a connection
pool and/or asynchronous function (for further information about this from the author
of better-sqlite3, see [here](https://github.com/WiseLibs/better-sqlite3/issues/32)).

As such, the pool is effectively disabled for Sqlite by setting the `min` and `max`
values to 1.