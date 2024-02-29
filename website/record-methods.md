# Record Methods

A record object is a wrapper around a row of data from a table.

As per the previous examples, we'll assume the table definition looks
something like this:

```js
// define the users table and the columns it contains
const db = connect({
  database: 'sqlite://test.db',
  tables: {
    users: {
      columns: 'id name:required email:required'
    }
  }
});

// fetch the users table
const users = await db.table('users');

// fetch a record from the users table
const record = await users.oneRecord({
  email: 'bobby@badgerpower.com'
})
```

## update(set)

The `update()` method allows you to update any columns in the row that the record
represents.

```js
await record.update({
  name:  'Robert Badger, Esq.',
  email: 'robert@badgerpower.com'
})
```

The data will be updated in both the database table row and the record object.
Any other changes in the database row (e.g. a `modified` column that is set to
the current timestamp when a record is modified) will also be reflected in the
record.

```js
console.log(record.name);       // Robert Badger, Esq.
```

## delete()

The `delete()` method allows you to delete the row in the table represented by
the record.

```js
await record.delete();
console.log(record.deleted)     // true
```

After deleting the record the `record.deleted` flag will be set `true`.  Any
attempt to update the record (or delete it again) will throw a `DeletedRecordError`
with a message of the form `Cannot update deleted users record #123`.

## relation(name)

This method allows you to access relations for a table.  Read more on that in
the [relations](relations) manual page.

For example, if your `users` table has a `orders` relation defined then you can
access the related record(s) like so:

```js
const orders = await record.relation('orders');
```

The Proxy wrapper also allows you to access it more succinctly as:

```js
const orders = await record.orders;
```

## Where Next?

In the next few section we'll look at how you can define your own
custom [record class](record-class) where you can put
additional functionality relating to a record.