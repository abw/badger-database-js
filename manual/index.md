# badger-database

<img src="./images/badger2.svg" width="300"/>

This is the manual for the `badger-database` Javascript module.

## Table of Contents

* [Installation](manual/installation.html) - installing the library
* [Connecting](manual/connecting.html) - connecting to a database
* [Basic Queries](manual/basic_queries.html) - performing basic SQL queries
* [Named Queries](manual/named_queries.html) - defining named SQL queries for abstraction and reusability
* [Query Fragments](manual/query_fragments.html) - defining named SQL fragments for embedding into queries
* [Query Builder](manual/query_builder.html) - building SQL queries programmatically
* [Query Builder Methods](manual/builder_method.html) - methods for building SQL queries
* [Tables](manual/tables.html) - using tables to automatically generate basic queries
* [Table Columns](manual/table_columns.html) - defining table columns
* [Table Methods](manual/table_methods.html) - calling table methods
* [Table Queries](manual/table_queries.html) - defining named queries for tables
* [Table Class](manual/table_class.html) - defining custom table classes
* [Records](manual/records.html) - using records
* [Record Methods](manual/record_methods.html) - calling record methods
* [Record Class](manual/record_class.html) - defining custom record classes
* [Relations](manual/relations.html) - defining relations between tables
* [Transactions](manual/transactions.html) - using database transactions
* [Model](manual/model.html) - accessing database tables in a simpler form
* [Waiter](manual/waiter.html) - chaining together asynchronous operations
* [Debugging](manual/debugging.html) - enabling debugging messages
* [Extending](manual/extending.html) - extending badger-database to add your own functionality
* [Limitations](manual/limitations.html) - coping with the limitations of badger-database
* [Examples](manual/examples.html) - working examples using badger-database

## Method Reference

This is a brief summary of the object methods available.

### Database Methods

| Method | Description
|-|-|
| [connect(options)](manual/connecting.html) | Connect to the database and return a `Database` object|
| [disconnect()](manual/connecting.html#disconnecting) | Disconnect from the database |
| [run(query, values, options)](manual/basic_queries.html#run-query--values--options-) | Run a raw SQL query or named query |
| [one(query, values, options)](manual/basic_queries.html#one-query--values--options-) | Run a raw SQL query or named query to fetch exactly one row |
| [any(query, values, options)](manual/basic_queries.html#any-query--values--options-) | Run a raw SQL query or named query to fetch any single row |
| [all(query, values, options)](manual/basic_queries.html#all-query--values--options-) | Run a raw SQL query or named query to fetch all rows |
| [build](manual/query_builder.html) | Start a query builder chain |
| [select(columns)](manual/query_builder.html#select-queries) | Start a `SELECT` query builder chain with a column selection |
| [insert(columns)](manual/query_builder.html#insert-queries) | Start an `INSERT` query builder chain with a column selection |
| [update(table)](manual/query_builder.html#update-queries) | Start an `UPDATE` query builder chain with a table name |
| [delete(columns)](manual/query_builder.html#delete-queries) | Start an `DELETE` query builder chain with optional column specification |
| [transaction(code)](manual/transactions.html) | Execute queries in the scope of a transaction |
| [table(name)](manual/tables.html) | Lookup a named table and return a `Table` object|

### Table Methods

| Method | Description
|-|-|
| [run(query, values, options)](manual/table_queries.html#run-query--values--options-) | Run a raw SQL query or named query |
| [one(query, values, options)](manual/table_queries.html#one-query--values--options-) | Run a raw SQL query or named query to fetch exactly one row |
| [any(query, values, options)](manual/table_queries.html#any-query--values--options-) | Run a raw SQL query or named query to fetch any single row |
| [all(query, values, options)](manual/table_queries.html#all-query--values--options-) | Run a raw SQL query or named query to fetch all rows |
| [insert(data, options)](manual/table_methods.html#insert-data--options-) | Insert one or more rows of data |
| [insertOne(data, options)](manual/table_methods.html#insertone-data--options-) | Insert a single row of data |
| [insertAll(array, options)](manual/table_methods.html#insertall-array--options-) | Insert multiple rows of data |
| [insertOneRow(data, options)](manual/table_methods.html#insertonerow-data--options-) | Insert a single row of data and return the reloaded row|
| [insertAllRows(array, options)](manual/table_methods.html#insertallrows-array--options-) | Insert multiple rows of data and return an array of reloaded rows|
| [insertOneRecord(data, options)](manual/table_methods.html#insertonerecord-data--options-) | Insert a single row of data and return a record |
| [insertAllRecords(array, options)](manual/table_methods.html#insertallrecords-array--options-) | Insert multiple rows of data and return an array of records |
| [insertRecord(data, options)](manual/table_methods.html#insertonerecord-data--options-) | Alias for [insertOneRecord()](manual/table_methods.html#insertonerecord-data--options-) |
| [insertRecords(array, options)](manual/table_methods.html#insertallrecords-array--options-) | Alias for [insertAllRecords()](manual/table_methods.html#insertallrecords-array--options-) |
| [update(set, where, options)](manual/table_methods.html#update-set--where--options-) | Update one or more rows to set new values where matching criteria |
| [updateOne(set, where, options)](manual/table_methods.html#updateone-set--where--options-) | Update exactly one row to set new values where matching criteria |
| [updateAny(set, where, options)](manual/table_methods.html#updateany-set--where--options-) | Update any row to set new values where matching criteria |
| [updateAll(set, where, options)](manual/table_methods.html#updateall-set--where--options-) | Update all rows to set new values where matching criteria |
| [delete(where)](manual/table_methods.html#delete-where-) | Delete all rows where matching criteria |
| [fetch(where, options)](manual/table_methods.html#fetch-where--options-) | Fetch rows where matching criteria |
| [fetchOne(where, options)](manual/table_methods.html#fetchone-where--options-) | Fetch exactly one row where matching criteria |
| [fetchAny(where, options)](manual/table_methods.html#fetchany-where--options-) | Fetch any row where matching criteria |
| [fetchAll(where, options)](manual/table_methods.html#fetchall-where--options-) | Fetch all rows where matching criteria |
| [fetchOneRecord(where, options)](manual/table_methods.html#fetchonerecord-where--options-) | Fetch exactly one row where matching criteria and return as a record|
| [fetchAnyRecord(where, options)](manual/table_methods#fetchanyrecord-where--options-) | Fetch any row where matching criteria and return as a record|
| [fetchAllRecords(where, options)](manual/table_methods#fetchallrecords-where--options-) | Fetch all rows where matching criteria and return as a record|
| [fetchRecord(where, options)](manual/table_methods#fetchonerecord-where--options-) | Alias for [fetchOneRecord()](manual/table_methods#fetchonerecord-where--options-) |
| [fetchRecords(where, options)](manual/table_methods#fetchallrecords-where--options-) | Alias for [fetchAllRecords()](manual/table_methods#fetchallrecords-where--options-) |
| [oneRow(query, args)](manual/table_queries.html#onerow-query--args-) | Select exactly one row using [fetchOne()](manual/table_methods.html#fetchone-where--options-) or [one()](manual/table_queries.html#one-query--values--options-) as appropriate|
| [anyRow(query, args)](manual/table_queries.html#anyrow-query--args-) | Select any single row using [fetchAny()](manual/table_methods.html#fetchany-where--options-) or [any()](manual/table_queries.html#any-query--values--options-) as appropriate|
| [allRows(query, args)](manual/table_queries.html#allrows-query--args-) | Select all rows using [fetchAll()](manual/table_methods.html#fetchall-where--options-) or [all()](manual/table_queries.html#all-query--values--options-) as appropriate|
| [oneRecord(query, args)](manual/table_queries.html#onerecord-query--args-) | Select exactly one row using [fetchOne()](manual/table_methods.html#fetchone-where--options-) or [one()](manual/table_queries.html#one-query--values--options-) as appropriate and return as a record|
| [anyRecord(query, args)](manual/table_queries.html#anyrecord-query--args-) | Select any single row using [fetchAny()](manual/table_methods.html#fetchany-where--options-) or [any()](manual/table_queries.html#any-query--values--options-) as appropriate and return as a record|
| [allRecords(query, args)](manual/table_queries.html#allrecords-query--args-) | Select all rows using [fetchAll()](manual/table_methods.html#fetchall-where--options-) or [all()](manual/table_queries.html#all-query--values--options-) as appropriate and return as a record|
| [build](manual/table_queries.html#query-builder) | Start a query builder chain |
| [select(columns)](manual/table_queries.html#query-builder) | Start a query builder chain with column selection and table pre-defined|
| [record(row)](manual/table_methods.html#record-row-) | Convert a row to a record object |
| [records(rows)](manual/table_methods.html#records-rows-) | Convert an array of rows to an array of record objects |

### Record Methods
| Method | Description
|-|-|
| [update(set)](manual/record_methods.html#update-set-) | Update the record to set new values |
| [delete()](manual/record_methods.html#delete--)| Delete the corresponding row from the database |
| [relation(name)](manual/record_methods.html#relation-name-) | Fetch record or records from a named relation |


## Implementation Details

The library is implemented using ES6 modules.  A bundle for CJS is also provided.

All asynchronous functions and methods return promises.

## Notes on Case Conventions

The Javascript convention is to use StudlyCaps for class names (e.g. `Artists`) and
camelCase for methods, function, variables, etc., (e.g. `albumTracks`).

When it comes to database table and columns names you might want to adopt the same
convention.  That's fine.  However, be warned that many databases are case insensitive
by default.  As a result you might find that the database you're using returns the
data with column names converted to lower case.  Most databases have an option to make
it case sensitive so you might want to look into that.

I prefer to avoid the problem altogether by defining my database tables and columns using
snake_case (e.g. `artists`, `artist_id`, `album_tracks`, etc). I typically use a number
of other programming languages to access the same database in a project and many other
languages (e.g. Rust, Perl, Python, PHP, etc.) use snake_case by convention.

In these examples I've adopted this convention because it's what works for me.  It doesn't
bother me that I have to think in snake_case when I'm accessing row data, but camelCase
when using method names.  In fact, I think it probably helps me to differentiate between
"raw" data from the database and code.  You may disagree, and of course, you are free to
adopt your own convention that does it differently.

# Author

[Andy Wardley](https://github.com/abw)
