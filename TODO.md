# TODO List

* Add transactions

* should table insert() have option to return data (with id added) instead of
  re-fetching row?

* table fetch columns with aliases: { alias: column } ???

* waiter is not throwing errors (or the test aren't picking them up)

* database inspection to grok tables automagically?

* API documentation

* Query builder - add support for with()

* Update debugging options - queries is no longer valid

* Fix rollup/terser problems with source map (or is this node?)

* ability to fetch a single column, e.g. as an option
  ...all([], { column: 'x' })

* Add cross join `<=x=>` or `<x>`

* functions for munging allValues must be updated to include setValues

* document the above

* document query builder for insert, update and delete

* See if it's possible to rationalise table methods insert(), update(),
  select() and delete() to work as both data query constructors (e.g.
  `insert({ name: 'Andy' })`) and as the start of a query chain.