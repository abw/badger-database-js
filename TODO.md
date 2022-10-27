# TODO

## Features

* should table `insert()` have option to return data (with id added) instead of
re-fetching row?

* table fetch columns with aliases: `{ alias: column }` ???

* database inspection to grok tables automagically?

* Query builder - add support for with()

* ability to fetch a single column, e.g. as an option
`...all([], { column: 'x' })`

* Add cross join `<=x=>` or `<x>`

* See if it's possible to rationalise table methods insert(), update(),
select() and delete() to work as both data query constructors (e.g.
`insert({ name: 'Andy' })`) and as the start of a query chain.

## Fixes

* functions for munging allValues must be updated to include setValues

## Bugs

* waiter is not throwing errors (or the test aren't picking them up)

* Fix rollup/terser problems with source map (or is this node?)

## Documentation

* Document table insertRow()/insertOneRow() and insertRows()/insertAllRows()
which automatically set reload option, and look into adding to updateXXX

* API documentation

## Transactions

* Have engine detect a transaction option and use its connection instead of
taking a new one from the pool [DONE - but subject to change]

* Database must NOT reuse any cached table to ensure a new table is created
with Queryable proxy [DONE - but subject to change]

* database.build, database.model and database.waiter must be reconstituted as
wrappers around a transaction proxy [database.build is done]

* check that named queries that use the query builder get rooted on a transaction
proxy [DONE - but subject to change]

* decide if it's best for uncompleted transactions (that haven't called commit
or rollback) to autoRollback quietly, or do it and throw an error [DONE - explicit
errors are best]
