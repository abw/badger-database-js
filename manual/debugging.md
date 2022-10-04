# Debugging

To enable debugging messages for the database library add the `debug` flag to the
`connect()` configuration, set to `true`.

```js
const db = await connect({
  database: 'sqlite:memory',
  debug: true
})
```

To enable debugging for individual tables, add the `debug` flag to the table
configuration.

```js
const db = await connect({
  database: 'sqlite:memory',
  tables: {
    users: {
      columns: 'id name email',
      debug: true,
    }
  }
})
```

To enable debugging for a record object associated with a table, set the `recordConfig`
for the table to include the `debug` flag.

```js
const db = await connect({
  database: 'sqlite:memory',
  tables: {
    users: {
      columns: 'id name email',
      recordConfig: {
        debug: true
      }
    }
  }
})
```

To enable debugging on a global level (for example, to enable it for all tables,
records, etc.), use the `setDebug` function.  You can set any of the following
flags to `true` to enable debugging for that component.

```js
import { connect, setDebug } from '../src/Utils/Debug.js';

setDebug({
  database: true,   // general database queries
  engine:   true,   // lower level functionality
  queries:  true,   // query lookup and expansion
  table:    true,   // table methods
  record:   true,   // record methods
})
```