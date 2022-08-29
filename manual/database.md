# Database

The `Database` class provides a wrapper around a
[Knex.js](https://knexjs.org/) database connection.

## Configuration

The configuration parameters should include the
`client` and `connection` parameters as a minimum,
along with any other optional configuration parameters
accepted as
[Knex.js configuration options](https://knexjs.org/guide/#configuration-options)

For example, a connection to a `sqlite3` database might look like this:

```js
import Database from '@abw/badger-database'

const database = new Database({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
  pool: {
    min: 2,
    max: 10,
  }
})
```

