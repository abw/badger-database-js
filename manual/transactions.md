# Transactions

**WARNING** Transactions are a work in progress.  There are some known
loose ends, possible bugs, and the implementation is subject to change.

We'll start by connecting to a database in the usual way.

```js
import connect from '@abw/badger-database'

const db = connect({ database: 'sqlite:memory' });
```

A transaction is run by calling the `transaction()` method on the
database.  You should pass it a function which will contain all
the code that will be run inside the transaction.  The function
will be passed three parameters: a reference to the database, a
commit function and a rollback function.

```js
await db.transaction(
  async (db, commit, rollback) => {
    await db.run('...some query...');
    if (...some condition...) {
      await commit();
    }
    else {
      await rollback();
    }
  }
)
```

You **MUST** use the database reference provided to the function for
all database operations.  Call the `commit()` function to commit the
changes made in the transaction, or `rollback()` to roll them back.
You can only call `commit()` or `rollback()`, not both, and you must
call at least one of them.  If your code throws an error then the
transaction will automatically be rolled back.

You can also call the `db.commit()` or `db.rollback()` methods if you
prefer.

```js
await db.transaction(
  async db => {
    await db.run('...some query...');
    if (...some condition...) {
      await db.commit();
    }
    else {
      await db.rollback();
    }
  }
)
```

You can pass an object containing configuration options as a second
argument to the `transaction()` method.  This can contain the `autoCommit`
or `autoRollback` options which will causes the transaction to be automatically
committed or rolled back, respectively.  This will only happen if you don't
manually call either `commit()` or `rollback()` within your transaction code.
If an error is thrown then the transaction will always be rolled back,
regardless of these settings.

```js
await db.transaction(
  async db => {
    await db.run('...some query...');
    if (...some condition...) {
      await db.rollback();
    }
    // else transaction will automatically be committed
  },
  { autoCommit: true }
)
```

```js
await db.transaction(
  async db => {
    await db.run('...some query...');
    if (...some condition...) {
      await db.commit();
    }
    // else transaction will automatically be rolled back
  },
  { autoRollback: true }
)
```

You can use all of the database methods inside the transaction.
You can also load tables and call their methods, but you **MUST**
fetch the table using the database reference passed to the transaction
code.

```js
await db.transaction(
  async db => {
    const users = await db.table('users');
    await users.insert({
      name: 'Brian Badger',
      email: 'brian@badgerpower.com',
    });
    await db.commit();
  }
)
```

You **MUST NOT** use any database or table references from outside
of the transaction code.  All references must be accessed through
the database reference passed to your code.

```js
const users = await db.table('users');

await db.transaction(
  async db => {
    // DO NOT DO THIS! - the existing users reference will not
    // execute queries in the context of the transaction
    await users.insert({
      name: 'Brian Badger',
      email: 'brian@badgerpower.com',
    });
    await db.commit();
  }
)
```

You can also use records within a transaction, but they **MUST**
be fetch from tables accessed through the database reference passed
to your transaction function.

```js
await db.transaction(
  async db => {
    const users = await db.table('users');
    const brian = await users.fetchRecord({
      email: 'brian@badgerpower.com',
    });
    await brian.update({
      name: 'Brian the Badger'
    })
    await db.commit();
  }
)
```

