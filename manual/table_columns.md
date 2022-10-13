# Table Columns

For simple cases you can define table columns using a whitespace delimited string,
e.g. `id name email`.

```js
const db = connect({
  // ...database, etc...
  tables: {
    users: {
      columns: 'id name email'
    }
  }
});
const users = await db.table('users');
```

You don't have to include all of the columns in the database table if you don't
want to for some reason.  If there are columns that you don't want or need to
access from your application code then you can omit them.  Just be warned that
you won't be able to access any columns that aren't defined here.

You can add flags to the column names.  These include `id` to denote the unique
identifier (this is optional if the column is already called `id` as we assume
that's the default name for the id column), `required` to indicate
that a column must be provided when a row is inserted, and `readonly` to indicate
that a column cannot be inserted or updated.  Multiple flags can be added, each
separated by a colon.

```js
const db = connect({
  // ...database, etc...
  tables: {
    users: {
      columns: 'id:readonly name:required email:required'
    }
  }
});
```

If you try to insert a row without providing any of the `required` columns
then an error will be throw.

```js
// Throws a ColumnValidationError: 'Missing required column "email" for the users table'
await users.insert({
  name: 'Brian Badger',
});
```

The same thing will happen if you try to insert or update a `readonly` column.

```js
// Throws a ColumnValidationError: 'The "id" column is readonly in the users table'
await users.insert({
  id:    999,
  name:  'Brian Badger',
  email: 'brian@badgerpower.com',
});
```

There may be times when you want to insert rows with pre-defined ids.  That's fine -
you don't have to define your id column as being readonly in this case.

```js
const db = connect({
  // ...database, etc...
  tables: {
    users: {
      columns: 'id name:required email:required'
    }
  }
});
const users = await db.table('users');

// This is fine - id isn't readonly
await users.insert({
  id:    999,
  name:  'Brian Badger',
  email: 'brian@badgerpower.com',
});
```

If your unique ID column isn't called `id` then you can mark the relevant column
using the `id` tag.

```js
const db = connect({
  // ...database, etc...
  tables: {
    users: {
      columns: 'user_id:readonly:id name:required email:required'
    }
  }
});
```

In the rare cases where you don't have a unique id column and instead you have multiple
keys that are used to uniquely identify a row then you can mark them with the `key` tag.
For example, you might have an `employee` table which has rows that are uniquely identified
by the `company_id` and `user_id` columns.

```js
const db = connect({
  // ...database, etc...
  tables: {
    employees: {
      columns: 'company_id:key user_id:key job_title'
    }
  }
});
```

Note that some databases (e.g. Sqlite) will automatically create an `id` for each
row regardless.  There certainly are valid cases where you might chose to NOT have
a unique id column in a database but they are generally few and far between.
See [this Stack Overflow post](https://stackoverflow.com/questions/1207983/in-general-should-every-table-in-a-database-have-an-identity-field-to-use-as-a) for
further enlightenment.

Defining the columns using a string is a convenient short hand for simpler
tables.  The more explicit form is to use an object with the column names as
keys.  The corresponding values can be strings containing any flags for the
columns, or an empty string if there aren't any.

```js
const db = connect({
  // ...database, etc...
  tables: {
    users: {
      columns: {
        user_id: 'readonly:id',
        name:    'required',
        email:   'required',
        comment: '',
    }
  }
});
```

Or you can fully expand them like so:

```js
const db = connect({
  // ...database, etc...
  tables: {
    users: {
      columns: {
        user_id: {
          readonly: true,
          id:       true
        },
        name: {
          required: true
        }
        email: {
          required: true
        }
        comment: { }
      }
    }
  }
});
```
