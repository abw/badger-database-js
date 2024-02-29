# Record Class

You can define your own custom record class for each table in the database.
This allows you to add your own methods for performing queries on the record
data or other business logic.

You should extend the `Record` base class and then define it as the `recordClass`
option in the table definition.

Here's a complete example.

```js
import { connect, Record } from '@abw/badger-database';

export class User extends Record {
  hello() {
    return 'Hello ' + this.row.name;
  }
}

const db = connect({
  database: 'sqlite:memory',
  tables: {
    users: {
      // bind in the custom record class
      recordClass: User,
      // column definitions
      columns: 'id name email animal',
      // query definitions
      queries: {
        create: `
          CREATE TABLE users (
            id     INTEGER PRIMARY KEY ASC,
            name   TEXT,
            email  TEXT,
            animal TEXT
          )`
      }
    },
  }
});

// fetch users table object
const users = await db.table('users');

// run the 'create' query to create the database table
await users.run('create');

// insert a row
await users.insert({
  name:   'Bobby Badger',
  email:  'bobby@badgerpower.com',
  animal: 'Badger'
});

// fetch a record
const user = await users.oneRecord({
  email: 'bobby@badgerpower.com'
})

// now call the custom hello() method on the record
console.log(user.hello());    // Hello Bobby Badger
```

## Record Configuration Options

If you want to pass additional configuration options to the record
object then you can define them as the `recordConfig` configuration
option in the corresponding table configuration.

```js
const db = connect({
  // ...database, etc.
  tables: {
    users: {
      recordClass: User,
      recordConfig: {
        hello: 'Hiya'
      }
    },
  }
});
```

The `recordConfig` parameters will then be available in the record
object as `this.config`.  For example, we can rewrite the `hello()`
method to use the configuration value for `hello`:

```js
export class User extends Record {
  hello() {
    return `${this.config.hello || 'Hello'} ${this.row.name}`;
  }
}
```

Now when the `hello()` method is called on a user record object
a different greeting will be returned:

```js
console.log(user.hello());    // Hiya Brian Badger
```

If you want to perform any initialisation of the record then you can override
the constructor function.  It is passed three arguments: a reference to the
`table` object, the `row` of data, and any configuration options.  Make sure
you call the `super()` constructor before you do anything else.

```js
export class User extends Record {
  constructor(table, row, config={}) {
    super(table, row, config);
    this.greeting = config.hello || 'Hello';
  }
  hello() {
    return `${this.greeting} ${this.row.name}`;
  }
}
```

## Where Next?

In the next section we'll look at how you can define [relations](relations)
between different records in your database.
