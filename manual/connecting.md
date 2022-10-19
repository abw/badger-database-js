# Connecting

The `connect()` function is used to connect to a database.  It is the default
export from the `@abw/badger-database` module.

```js
import connect from '@abw/badger-database'
```

You can also use named imports.

```js
import { connect } from '@abw/badger-database'
```

Or you can use `require()` if you're still using Common JS format.

```js
const { connect } = require('@abw/badger-database')
```

## Connection String

The simplest way to connect to a database is using a connection string for the
`database` parameter. This is a concept that should be familiar to Postgres users.

```js
const db = connect({
  database: 'postgresql://user:password@hostname:5432/database'
})
```

Internally we use the slightly shorter name of `postgres` (no `ql` at the end)
for the Postgres engine name.  To avoid any chance of confusion, we also support
this in the connection string and automatically "correct" it for you.

```js
const db = connect({
  // 'postgres://...' works the same as 'postgresql://...'
  database: 'postgres://user:password@hostname:5432/database'
})
```

You can use the same connection string format for Mysql databases:

```js
const db = connect({
  database: 'mysql://user:password@hostname:3306/database'
})
```

MariaDB is a drop-in replacement for MySQL so you can use the exact
same `mysql` connection string for a MariaDB database.  You can use
the `maria` or `mariadb` prefix if you prefer as they're defined as
aliases for `mysql`.

```js
const db = connect({
  database: 'mariadb://user:password@hostname:3306/database'
})
```

The same connection string is also supported for Sqlite databases,
although here the only parameter supported is the database filename.

```js
const db = connect({
  database: 'sqlite://database'
})
```

For an in-memory Sqlite database, use `:memory:` as the database name:

```js
const db = connect({
  database: 'sqlite://:memory:'
})
```

Or if you find that a bit clunky, you can use the shortened version:

```js
const db = connect({
  database: 'sqlite:memory'
})
```

Most of the elements are optional for Postgres and Mysql databases.
Here are the minimal versions which assume the default host (`localhost`),
port (`3306` for Mysql and `5432` for Postgres) and no username or password.

```js
const db = connect({
  database: 'postgresql://database'
})
```

```js
const db = connect({
  database: 'mysql://database'
})
```

If there are any additional configuration options that you want to pass to the
underlying database engine module (`better-sqlite3`, `mysql2/promise` or `pg`)
then you can provide them as `engineOptions`.

```js
const db = connect({
  database: 'sqlite:memory',
  engineOptions: {
    verbose: console.log
  }
})
```

```js
const db = connect({
  database: 'mysql://database',
  engineOptions: {
    dateStrings: true
  }
})
```

```js
const db = connect({
  database: 'postgres://database',
  engineOptions: {
    queryTimeout: 3000
  }
})
```

## Connection Parameters

The connection strings shown in the previous sections are short-hand versions
for the more verbose form.  If your connection parameters are stored in a file,
loaded via an API call, or fetched in some other way then it may be more
convenient to use this form.

```js
const db = connect({
  // "postgres://badger:s3cr3t@dbhost.com:5433/animals" is short for:
  database: {
    engine:   'postgres',   // or 'postgresql'
    user:     'badger',
    password: 's3cr3t',
    host:     'dbhost.com',
    port:     '5433',
    database: 'animals',
  }
})
```

The same configuration options apply to Mysql.  The only difference is that
you should use `mysql` (or `mariadb`) as the engine name.

```js
const db = connect({
  // "mysql://badger:s3cr3t@dbhost.com:5433/animals" is short for:
  database: {
    engine:   'mysql',   // or 'maria' / 'mariadb'
    user:     'badger',
    password: 's3cr3t',
    host:     'dbhost.com',
    port:     '5433',
    database: 'animals',
  }
})
```

For Sqlite the only supported option is `filename`.

```js
const db = connect({
  database: {
    engine:   'sqlite',
    filename: 'animals.db',
  }
})
```

You can also use `:memory:` as the `filename` for an in-memory database.

```js
const db = connect({
  database: {
    engine:   'sqlite',
    filename: ':memory:',
  }
})
```

When using this expanded format, any additional configuration options for the engine
module can be included directly in the `database` specification.

```js
const db = connect({
  database: {
    engine:   'sqlite',
    filename: ':memory:',
    verbose:  console.log
  }
})
```

```js
const db = connect({
  database: {
    engine:      'mysql',
    database:    'animals',
    dateStrings: true
  }
})
```

```js
const db = connect({
  database: {
    engine:       'postgres',
    database:     'animals',
    queryTimeout: 3000
  }
})
```

## Connection Parameter Aliases

Whenever I'm writing the code to connect to a database there's a good chance I'll get
at least one of the parameter names wrong.  Is it `user` or `username`? `pass` or
`password`? `host` or `hostname`? `file` or `filename`?  I can never remember.

To save you from having to google it you can specify any of the "incorrect" parameters
and they will be automatically corrected.

For example, if you specify `file` instead of `filename` for a Sqlite database, we'll
silently correct it.

```js
const db = connect({
  database: {
    engine: 'sqlite',
    file:   'animals.db',   // converted to 'filename'
  }
})
```

This also just works:

```js
const db = connect({
  database: {
    engine:   'postgres',
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
const db = connect({
  database: {
    engine:   'postgres',
    database: 'animals',
    username: 'badger',     // converted to 'user'
    password: 's3cr3t',
    hostname: 'dbhost.com', // converted to 'host'
    port:     '5433',
  }
})
```

You can also use `name` as an alias for `database`:

```js
const db = connect({
  database: {
    engine:   'postgres',
    name:     'animals',
  }
})
```

## Environment Variables

You can configure the database using environment variables.
A database connection string should be defined as the `DATABASE`
environment variable.

For example, you could define `DATABASE` in a `.env` file:

```bash
DATABASE=sqlite:memory
```

You can load the environment variables from the `.env` file
using [dotenv](https://www.npmjs.com/package/dotenv) or a similar
module. The environment variables will then be defined in `process.env`.
Pass these to the `connect` function as `env`.

```js
import dotenv from 'dotenv'
import process from 'node:process'
import connect from '@abw/badger-database'

// load the .env file
dotenv.config();

const db = connect({
  env: process.env
});
```

You can also define different database parameters using the `DATABASE_`
prefix.  For example, for a Sqlite in-memory database:

```bash
DATABASE_ENGINE=sqlite
DATABASE_FILENAME=:memory:
```

Or for a Mysql database:

```bash
DATABASE_ENGINE=mysql
DATABASE_NAME=animals
DATABASE_USER=badger
DATABASE_PASSWORD=s3cr3t
```

If you want to use a different environment variable name or prefix, then
define it using the `envPrefix` option.

```js
const db = connect({
  env: process.env
  envPrefix: 'MY_DB'
});
```

Then you can define the database connection string like so:

```
MY_DB=sqlite:memory
```

Or using separate environment variables like this:

```bash
MY_DB_ENGINE=mysql
MY_DB_NAME=animals
MY_DB_USER=badger
MY_DB_PASSWORD=s3cr3t
```

When using environment variables any additional configuration options for the
database engine should be provided in the `engineOptions` configuration item.

```js
const db = connect({
  env: process.env
  envPrefix: 'MY_DB',
  engineOptions: {
    verbose: console.log
  }
});
```

## Pool Options

The Postgres and Mysql database engines use a connection pool for efficiency.
By default, the minimum number of connections is 2 and the maximum is 10.  You
can change these values using the `pool` option.

```js
const db = connect({
  database: { ... },
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

## Disconnecting

When you're finished using the database you should call the `disconnect()` method on
it.

```js
db.disconnect()
```