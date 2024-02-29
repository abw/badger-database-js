# Transactions

Transactions allow you to write a sequence of queries that can
be committed to the database in one go.  If any single query fails,
then all changes can be rolled back.  The classic example is in
a banking application where money is debited from one account and
credited to another.  Both queries must successfully complete, or
neither of them should.

We'll start by connecting to a database in the usual way.

```js
import connect from '@abw/badger-database'

const db = connect({ database: 'sqlite:memory' });
```

## transaction()

A transaction is run by calling the `transaction()` method on the
database.  You should pass it a function which will contain all
the code that will be run inside the transaction.  The function
will be passed three parameters: a reference to the database, a
commit function and a rollback function.

```js
await db.transaction(
  async (tdb, commit, rollback) => {
    await tdb.run('...some query...');
    await tdb.run('...another query...');

    if (...all is goood...) {
      await commit();
    }
    else {
      await rollback();
    }
  }
)
```

You **MUST** use the database reference provided to the function for
all database operations (shown as `tbd` in these examples).

## commit() and rollback()

Call the `commit()` function to commit the changes made in the transaction,
or `rollback()` to roll them back.

You can only call `commit()` or `rollback()`, not both, and you must
call at least one of them.  If your code throws an error then the
transaction will automatically be rolled back, as long as you haven't
already called `commit()` or `rollback()`.

You can also call the `tdb.commit()` or `tdb.rollback()` methods if you
prefer.

```js
await db.transaction(
  async tdb => {
    await tdb.run('...some query...');
    await tdb.run('...another query...');

    if (...all is good...) {
      await tdb.commit();
    }
    else {
      await tdb.rollback();
    }
  }
)
```

## Configuration Options

You can pass an object containing configuration options as a second
argument to the `transaction()` method.  This can contain the `autoCommit`
or `autoRollback` options which will causes the transaction to be automatically
committed or rolled back, respectively.  This will only happen if you don't
manually call either `commit()` or `rollback()` within your transaction code.
If an error is thrown then the transaction will always be rolled back,
regardless of these settings.

```js
await db.transaction(
  async tdb => {
    await tdb.run('...some query...');
    await tdb.run('...another query...');

    if (...something bad happened...) {
      await tdb.rollback();
    }
    // else transaction will automatically be committed
  },
  { autoCommit: true }
)
```

```js
await db.transaction(
  async tdb => {
    await tdb.run('...some query...');
    await tdb.run('...another query...');

    if (...all is good...) {
      await tdb.commit();
    }
    // else transaction will automatically be rolled back
  },
  { autoRollback: true }
)
```

You can also add the `debug` option to generating debugging messages
for the transaction.

```js
await db.transaction(
  async tdb => {
    // your transaction code
  },
  { debug: true }
)
```

## Notes

You can use all of the database methods inside the transaction,
including [named queries](named-queries) and the
[query builder](query-builder).

You can also load tables and call their methods, but you **MUST**
fetch the table using the database reference passed to the transaction
code.

```js
await db.transaction(
  async tdb => {
    const users = await tdb.table('users');
    await users.insert({
      name: 'Brian Badger',
      email: 'brian@badgerpower.com',
    });
    await tdb.commit();
  }
)
```

You **MUST NOT** use any database or table references from outside
of the transaction code.  All references must be accessed through
the database reference passed to your code.

```js
const users = await db.table('users');

await db.transaction(
  async tdb => {
    // DO NOT DO THIS! - the existing users reference will not
    // execute queries in the context of the transaction
    await users.insert({
      name: 'Brian Badger',
      email: 'brian@badgerpower.com',
    });
    await tdb.commit();
  }
)
```

You can also use records within a transaction, but they **MUST**
be fetched from tables accessed through the database reference passed
to your transaction function.

```js
await db.transaction(
  async tdb => {
    const users = await tdb.table('users');
    const brian = await users.fetchRecord({
      email: 'brian@badgerpower.com',
    });
    await brian.update({
      name: 'Brian the Badger'
    })
    await tdb.commit();
  }
)
```

You can also use the [model](model) and [waiter](waiter)
utilities, but once again, you **MUST** access them via the database reference
passed to the function.

```js
await db.transaction(
  async tdb => {
    await tdb.waiter.model.users
      .fetchRecord({ email: 'brian@badgerpower.com' })
      .update({ name: 'Brian the Badger' })
    await tdb.commit();
  }
)
```
