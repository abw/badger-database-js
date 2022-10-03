# Record

This is a wrapper around a database row.  It is a basic implementation of
the Active Record pattern.

* [Overview](#overview)
* [Methods](#methods)
  * [update(set)](#update-set-)
* [Functions](#functions)
  * [record(table,data,options)](#record-table-data-options-)

## Overview

A record is created from a row by chaining the `record()` method on the
query returned by the [insertRow()](manual/table.html#insertrow-data-),
[selectRow()](manual/table.html#selectrow-columns-) or
[fetchRow()](manual/table.html#fetchrow-where-) methods of a [Table](manual/table.html).

```js
const rec = await table.fetchRow({ animal: "badger" }).record();
```

Similarly, an array of records is created from an array of rows by chaining the
`records()` method on the query returned by the [insertRows()](manual/table.html#insertrows-data-),
[selectRows()](manual/table.html#selectrows-columns-) or
[fetchRows()](manual/table.html#fetchrows-where-) methods.

The data items returned in the row can be accessed as properties of the record.

```js
const badger = await table.fetchRow({ animal: "badger" }).record();
console.log("badger email is", badger.email);
```

## Methods

In addition to accessing data properties of the record, you can call additional
methods.

### update(set)

Method to update the record, implemented as a call to the [update()](manual/table.html#update-set-where-)
method of the [Table](manual/table.html).

```js
await badger.update({ forename: 'Roberto' });
console.log("badger forename is", badger.forename);     // Roberto
```

The database row will be updated and then the data will be reloaded into the record.
Any changes to columns in the row that are changed on update (e.g. a `modified` column
which sets the current timestamp on update) will be reflected in the record object.

## Functions

### record(table,data,options)

A function of convenience which wraps a call to `new Record()`.

```js
import { record } from '@abw/badger-database';
const rec = record(...);
```

This is equivalent to:

```js
import { Record } from '@abw/badger-database';
const rec = new Record(...);
```