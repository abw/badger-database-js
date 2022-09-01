# Badger Database

This is a simple but powerful database management tool that
is built around [Knex.js](https://knexjs.org/).  It is
designed for building database abstraction layers that allow
your application code to access a database while keeping the
nitty-gritty detail mostly hidden from view.

It embraces the power of both Knex and raw SQL, but provides
some of the basic functionality of ORMs to help automate many
of the tedious and repetitive tasks associated with using a
relational database.  It uses a variation of the Active Record
pattern - the variation being that the record objects are used
only to represent rows in a database with separate table classes
being employed to represent tables for a better separation of
concerns.

It is a work in progress loosely based on the Perl
[Badger::Database](https://github.com/abw/Badger-Database) library.
It is being written to help migrate a number of old Perl projects
to Javascript.

Feel free to use it for your own projects but be warned that
I wrote it to help me get my own job done.  I don't plan to spend
too much time supporting it, updating it, or adding features that
aren't immediately useful to me.

That said, it's a simple project totalling less than a thousand lines
of code.  An experienced Javascript programmer with knowledge of
Knex.js should be able to grok the code in an hour or so.  If you're
happy to use the source, Luke, then it may be the droids you're looking
for.  But if you're looking for a fully-featured, production-ready
solution then it might not be for you - there are *plenty* of other
Javascript ORMs that might be a better place to start.

For further information please read the [documentation](https://abw.github.io/badger-database-js/docs/manual/index.html).

## TODO

Table relations

Table queries.

Deprecate the "@colset1" format for including columns sets.

Implement "@relatedTable" to reference columns in related table.

    properties.select("@address")  # default set in related address table
    properties.select("...admin@address")  # admin set in related address table

How to specify multiple columns from another set?

    properties.select("line1@address line2@address line3@address")  # yawn
    properties.select("line1,line2@address")   # Nope, we allow "," as a normal column delimiter
    properties.select("line1&line2@address")   # Not loving it
    properties.select("line1|line2@address")   # Nope
    properties.select("[line1 line2]@address") # Yech - space causes parsing hardness
    properties.select("line1+line2@address")   # Maybe
    properties.select("line1+line2@address")   # Maybe - but implies "a+b+c" is valid

