# Method Reference

This is a brief summary of the object methods available.

## Database Methods

| Method | Description
|-|-|
| [connect(options)](connecting) | Connect to the database and return a `Database` object|
| [disconnect()](connecting#disconnecting) | Disconnect from the database |
| [run(query, values, options)](basic-queries#run) | Run a raw SQL query or named query |
| [one(query, values, options)](basic-queries#one) | Run a raw SQL query or named query to fetch exactly one row |
| [any(query, values, options)](basic-queries#any) | Run a raw SQL query or named query to fetch any single row |
| [all(query, values, options)](basic-queries#all) | Run a raw SQL query or named query to fetch all rows |
| [build](query-builder) | Start a query builder chain |
| [select(columns)](query-builder#select-queries) | Start a `SELECT` query builder chain with a column selection |
| [insert(columns)](query-builder#insert-queries) | Start an `INSERT` query builder chain with a column selection |
| [update(table)](query-builder#update-queries) | Start an `UPDATE` query builder chain with a table name |
| [delete(columns)](query-builder#delete-queries) | Start an `DELETE` query builder chain with optional column specification |
| [transaction(code)](transactions) | Execute queries in the scope of a transaction |
| [table(name)](tables) | Lookup a named table and return a `Table` object|

## Table Query Methods

| Method | Description
|-|-|
| [run(query, values, options)](table-queries#run-query-values-options) | Run a raw SQL query or named query |
| [one(query, values, options)](table-queries#one-query-values-options) | Run a raw SQL query or named query to fetch exactly one row |
| [any(query, values, options)](table-queries#any-query-values-options) | Run a raw SQL query or named query to fetch any single row |
| [all(query, values, options)](table-queries#all-query-values-options) | Run a raw SQL query or named query to fetch all rows |

## Table Insert Methods

| Method | Description
|-|-|
| [insert(data, options)](table-methods#insert-data-options) | Insert one or more rows of data |
| [insertOne(data, options)](table-methods#insertone-data-options) | Insert a single row of data |
| [insertAll(array, options)](table-methods#insertall-array-options) | Insert multiple rows of data |
| [insertOneRow(data, options)](table-methods#insertonerow-data-options) | Insert a single row of data and return the reloaded row|
| [insertAllRows(array, options)](table-methods#insertallrows-array-options) | Insert multiple rows of data and return an array of reloaded rows|
| [insertRow(data, options)](table-methods#insertonerow-data-options) | Alias for [insertOneRow()](table-methods#insertonerow-data-options) |
| [insertRows(array, options)](table-methods#insertallrows-array-options) | Alias for [insertAllRows()](table-methods#insertallrows-array-options) |
| [insertOneRecord(data, options)](table-methods#insertonerecord-data-options) | Insert a single row of data and return a record |
| [insertAllRecords(array, options)](table-methods#insertallrecords-array-options) | Insert multiple rows of data and return an array of records |
| [insertRecord(data, options)](table-methods#insertonerecord-data-options) | Alias for [insertOneRecord()](table-methods#insertonerecord-data-options) |
| [insertRecords(array, options)](table-methods#insertallrecords-array-options) | Alias for [insertAllRecords()](table-methods#insertallrecords-array-options) |

## Table Update Methods

| Method | Description
|-|-|
| [update(set, where, options)](table-methods#update-set-where-options) | Update one or more rows to set new values where matching criteria |
| [updateOne(set, where, options)](table-methods#updateone-set-where-options) | Update exactly one row to set new values where matching criteria |
| [updateAny(set, where, options)](table-methods#updateany-set-where-options) | Update any row to set new values where matching criteria |
| [updateAll(set, where, options)](table-methods#updateall-set-where-options) | Update all rows to set new values where matching criteria |
| [updateOneRow(set, where, options)](table-methods#updateonerow-set-where-options) | Update exactly one row with reload option to return updated row |
| [updateAnyRow(set, where, options)](table-methods#updateanyrow-set-where-options) | Update any row with reload option to return updated row |
| [updateRow(set, where, options)](table-methods#updateonerow-set-where-options) | Alias for [updateOneRow()](table-methods#updateonerow-set-where-options) |

## Table Delete Method

| Method | Description
|-|-|
| [delete(where)](table-methods#delete-where) | Delete all rows where matching criteria |

## Table Fetch Methods

| Method | Description
|-|-|
| [fetch(where, options)](table-methods#fetch-where-options) | Fetch rows where matching criteria |
| [fetchOne(where, options)](table-methods#fetchone-where-options) | Fetch exactly one row where matching criteria |
| [fetchAny(where, options)](table-methods#fetchany-where-options) | Fetch any row where matching criteria |
| [fetchAll(where, options)](table-methods#fetchall-where-options) | Fetch all rows where matching criteria |
| [fetchOneRecord(where, options)](table-methods#fetchonerecord-where-options) | Fetch exactly one row where matching criteria and return as a record|
| [fetchAnyRecord(where, options)](table-methods#fetchanyrecord-where-options) | Fetch any row where matching criteria and return as a record|
| [fetchAllRecords(where, options)](table-methods#fetchallrecords-where-options) | Fetch all rows where matching criteria and return as a record|
| [fetchRecord(where, options)](table-methods#fetchonerecord-where-options) | Alias for [fetchOneRecord()](table-methods#fetchonerecord-where-options) |
| [fetchRecords(where, options)](table-methods#fetchallrecords-where-options) | Alias for [fetchAllRecords()](table-methods#fetchallrecords-where-options) |
| [oneRow(query, args)](table-queries#onerow-query-args) | Select exactly one row using [fetchOne()](table-methods#fetchone-where-options) or [one()](table-queries#one-query-values-options) as appropriate|
| [anyRow(query, args)](table-queries#anyrow-query-args) | Select any single row using [fetchAny()](table-methods#fetchany-where-options) or [any()](table-queries#any-query-values-options) as appropriate|
| [allRows(query, args)](table-queries#allrows-query-args) | Select all rows using [fetchAll()](table-methods#fetchall-where-options) or [all()](table-queries#all-query-values-options) as appropriate|
| [oneRecord(query, args)](table-queries#onerecord-query-args) | Select exactly one row using [fetchOne()](table-methods#fetchone-where-options) or [one()](table-queries#one-query-values-options) as appropriate and return as a record|
| [anyRecord(query, args)](table-queries#anyrecord-query-args) | Select any single row using [fetchAny()](table-methods#fetchany-where-options) or [any()](table-queries#any-query-values-options) as appropriate and return as a record|
| [allRecords(query, args)](table-queries#allrecords-query-args) | Select all rows using [fetchAll()](table-methods#fetchall-where-options) or [all()](table-queries#all-query-values-options) as appropriate and return as a record|

## Other Table Methods

| Method | Description
|-|-|
| [build](table-queries#query-builder) | Start a query builder chain |
| [select(columns)](table-queries#query-builder) | Start a query builder chain with column selection and table pre-defined|
| [record(row)](table-methods#record-row) | Convert a row to a record object |
| [records(rows)](table-methods#records-rows) | Convert an array of rows to an array of record objects |

## Record Methods
| Method | Description
|-|-|
| [update(set)](record-methods#update-set) | Update the record to set new values |
| [delete()](record-methods#delete)| Delete the corresponding row from the database |
| [relation(name)](record-methods#relation-name) | Fetch record or records from a named relation |


