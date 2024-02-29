# Records

Various [table methods](table-methods) have the option
to return a record object instead of a plain Javascript data object
containing the row data.  Or, in the case
[`fetchAllRecords()`](table-methods#fetchallrecords-where-options) and
similar methods, they return an array of record objects.

The record object implements a lightweight version of the Active Record
pattern.

```js
const record = await users.oneRecord(
  { email: 'bobby@badgerpower.com' }
);
```

The row data loaded from the database is stored in the `row` property.
You can access individual items or the row data as a whole.

```js
console.log(record.row.id);      // e.g. 1
console.log(record.row.name);    // Bobby Badger
console.log(record.row.email);   // bobby@badgerpower.com
console.log(record.row);         // { id: 1, name: 'Bobby Badger', etc. }
```

Technically speaking, the methods actually return a Proxy object wrapper
around a record object (or an array of Proxy objects in the case of
[`fetchAllRecords()`](table-methods#fetchallrecords-where-options) et al).
The purpose of the Proxy object, among other things, is to give you access
to row data items without needing to specify the `.row` property.

```js
console.log(record.id);          // e.g. 1
console.log(record.name);        // Bobby Badger
console.log(record.email);       // bobby@badgerpower.com
```

This makes the record object look and feel just like a row of data, but with
some extra benefits.  For example, the [`update()`](record-methods#update-set)
method allows you to update the record and corresponding row in the database.

```js
await record.update({ name: 'Robert Badger' });
console.log(record.name); // Robert Badger
```

The Proxy object also gives you easy access to [relations](relations)
that are defined for the table.  For example, if the `users` table defines `orders`
as a relation then you can access them as `.orders`;

```js
const orders = await record.orders;
```

Note that any other properties or methods defined for the record will take
priority.  For example, `record.update` will resolve to the record
[`update()`](record-methods#update-set) method so if you have a
column called `update` then you must access it as `record.row.update`.

## Where Next?

In the next few sections we'll look at the [record methods](record-methods)
that are provided, and how to define your own custom [record class](record-class)
where you can put additional functionality relating to a record.