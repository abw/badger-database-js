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

## Bugs

* Fix rollup/terser problems with source map (or is this node?)

## Documentation

* API documentation

* Implementation details

