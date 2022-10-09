# Badger Database Examples

This directory contains a number of examples demonstrating the
functionality of the badger-database library.  Most of the examples
are based on those in the [manual](https://abw.github.io/badger-database-js/docs/manual/index.html).

The examples use a Sqlite memory database.  Be warned that the database
only persists while the example script is running.

Install the dependencies using your package manager of choice
(I tend to use pnpm these days):

```bash
$ pnpm install
```

You should then be able to run the `*/example.js` scripts.

```bash
$ node 01_basic_queries/example.js
$ node 02_named_queries/example.js
$ node 03_query_fragments/example.js
$ node 04_tables/example.js
$ node 05_table_class/example.js
$ node 06_records/example.js
$ node 07_musicdb/example.js
$ node 08_debugging/example.js
```
