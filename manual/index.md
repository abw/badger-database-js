# badger-database

<img src="./images/badger2.svg" width="300"/>

This is the manual for the `badger-database` Javascript module.

* [Installation](manual/installation.html) - installing the library
* [Connecting](manual/connecting.html) - connecting to a database
* [Basic Queries](manual/basic_queries.html) - performing basic SQL queries
* [Named Queries](manual/named_queries.html) - defining named SQL queries for abstraction and reusability
* [Query Fragments](manual/query_fragments.html) - defining named SQL fragments for embedding into queries
* [Tables](manual/tables.html) - using tables to automatically generate basic queries
* [Table Columns](manual/table_columns.html) - defining table columns
* [Table Methods](manual/table_methods.html) - calling table methods
* [Table Class](manual/table_class.html) - defining custom table classes
* [Records](manual/records.html) - using records
* [Record Methods](manual/record_methods.html) - calling record methods
* [Record Class](manual/record_class.html) - defining custom record classes
* [Relations](manual/relations.html) - defining relations between tables
* [Model](manual/model.html) - accessing database tables in a simpler form
* [Waiter](manual/waiter.html) - chaining together asynchronous operations
* [Debugging](manual/debugging.html) - enabling debugging messages
* [Extending](manual/extending.html) - extending badger-database to add your own functionality
* [Limitations](manual/limitations.html) - coping with the limitations of badger-database
* [Examples](manual/examples.html) - working examples using badger-database

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
languages (e.g. Rust, Perl, Python, etc.) use snake_case by convention.

In these examples I've adopted this convention because it's what works for me.  It doesn't
bother me that I have to think in snake_case when I'm accessing row data, but camelCase
when using method names.  In fact, I think it probably helps me to differentiate between
"raw" data from the database and code.  You may disagree, and of course, you are free to
adopt your own convention that does it differently.

# Author

[Andy Wardley](https://github.com/abw)
