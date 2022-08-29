# Tables

This is a wrapper around a database table.

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

## Methods

### query()

Returns a Knex query with the table name pre-defined.

### insert(data)

Insert data into the table.

```js
users.insert({
  forename: 'Bobby',
  surname: 'Badger',
  email: 'bobby@badger.com',
  is_admin: 1,
})
```

You can insert multiple rows in a single call.

```js
users.insert([
  {
    forename: 'Bobby',
    surname: 'Badger',
    email: 'bobby@badger.com',
    is_admin: 1,
  },
  {
    forename: 'Brian',
    surname: 'Badger',
    email: 'brian@badger.com',
    is_admin: 0,
  },
  {
    forename: 'Simon',
    surname: 'Stoat',
    email: 'simon@stoat.com',
  }
]);
```

### selectAll(columns) {

Returns a select query.  The optional `columns` argument can be used to
specify the columns or column sets you want to select.  Otherwise the
default column set will be used.

```js
table.selectAll();
table.selectAll("column1 column2 ...columnset");
table.selectAll().where({ animal: "badger" });
```

### selectOne(columns)

Returns a select query to fetch a single row.  The optional `columns` argument
can be used to specify the columns or column sets you want to select.  Otherwise
the default column set will be used.

```js
table.selectOne();
table.selectOne("column1 column2 ...columnset");
table.selectOne().where({ email: "bobby@badger.com" });
```

### fetchAll(where) {

Returns a select query.  The optional `where` argument can be used to
provide additional constraints.  This is shorthand for chaining a
`where()` method afterwards.

```js
table.fetchAll();
table.fetchAll({ animal: "badger" });
table.fetchAll().where({ animal: "badger" });   // same as above
```

### fetchOne(where) {

Returns a select query that fetches a single record.  The optional `where`
argument can be used to provide additional constraints.  This is shorthand
for chaining a `where()` method afterwards.

```js
table.fetchOne();
table.fetchOne({ animal: "badger" });
table.fetchOne().where({ animal: "badger" });   // same as above
```

### record(query)

Method to create a record object from a single row returned by a query.
This is called automagically by appending a `.record()` method to the
end of a query returned by `selectOne()` or `fetchOne()`.

```js
const badger = await table.fetchOne({ animal: "badger" }).record();
```

### records(query)

Method to create record objects from all rows returned by a query.
This is called automagically by appending a `.records()` method to the
end of a query returned by `selectAll()` or `fetchAll()`.

```js
const badgers = await table.fetchAll({ animal: "badger" }).records();
```
