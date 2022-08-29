# Overview

This is a simple but powerful database management tool that
is built around [Knex.js](https://knexjs.org/).  It is
designed for building database abstraction layers that allow
your application code to access a database while keeping the
nitty-gritty detail mostly hidden from view.

It provides some of the most basic functionality of ORMs to
help automate some of the tedious queries that you need to
write when using a database.  Things like basic insert, select,
update and delete queries.

It encourages you to use the full power of Knex to build more
complex queries.

It also embraces the fact that SQL is a powerful and (mostly)
portable query language.  It doesn't discourage you from writing
raw SQL queries.  On the contrary, it provides a mechanism to allow
you to define named SQL queries up front that you can call by
name.  This allows you to manage your queries in one place instead
of having SQL queries embedded all over your application code.

It also provides a way to compose SQL queries from
reusable SQL "fragments" to avoid repetition and simplify the
task of maintaining and updating queries when you make changes
to the database schema.

On top of that it provides [Table](manual/table.html) and
[Record](manual/record.html) modules which implement functionality
to help you work with database tables and record.  The
[Record](manual/record.html) is based on the Active Record pattern,
but adopts the philosophy that records should only represent
individual rows in the database.  The [Table](manual/table.html)
module is used instead for operations on the table like selecting,
inserting, searching, etc.

You can write custom table and record modules to implement your
own business logic, data validation, logging, or any other
functionality.