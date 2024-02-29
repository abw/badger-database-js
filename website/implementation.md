# Implementation Details

This section talks about how the library is implemented.  It's aimed at
people who are looking to maintain or extend the library, find and fix
bugs, or are looking to use it in a project and want to convince themselves
that it's suffiently well written and easy to reason about, should they
ever need to maintain or extend it themselves.

## Total Cost of Ownership

Free and Open Source software is fantastic. If you have a problem you need
to solve then you can spend days, weeks or months writing your own solution,
or you can download and use an Open Source library with a single command.
Not only is it free to use, but also has a greater chance of being well
documented and reliable.  It has (hopefully) been well tested by the author
and is widely used in the community, increasing the chances that any bugs in
it have already been found and fixed.  Software quality isn't something that
happens overnight.

However, it's important to understand that there are hidden costs in using
any piece of software.  Even if you don't have to pay any money to install
and use it, you still have to consider the ongoing costs associated with
maintenance.  If at some time in the future you find a bug or want to add a
new feature, you may find that the original author has stopped maintaining
the code, isn't interested in fixing the bug that you've found, doesn't want
to add your new feature, has retired and gone to live in a llama colony in
Outer Mongolia, or has simply disappeared off the face of the Earth.  At
this point, you're potentially on your own.

Before building your next big dotcom enterprise around any this library, or
indeed any key piece of technology, you should invest at least some of the
time you would have otherwise spent writing it yourself in getting to know
it.  Not only understanding how to use it, but also getting a feel for how
it works, evaluating the quality of the codebase, and considering how easy
it would be for you, or your future colleagues to maintain it, should you
ever need to.

Given that this is a new library as of 2022 (albeit one that is based on
a similar library written in Perl that's been used in production for nearly
20 years) that at the time of writing has a user base measured in single figures,
you should be especially cautious about adopting it without performing due
diligence.

This document provides a high-level overview of how `badger-database` works
to help you with that process.

## Key Components

The [Database](https://github.com/abw/badger-database-js/blob/master/src/Database.js)
module is the main interface to the library.  This is what gets returned
by the [`connect()`](connecting) function (defined down at the bottom
of the [Database.js](https://github.com/abw/badger-database-js/blob/master/src/Database.js)
file).

The [Database](https://github.com/abw/badger-database-js/blob/master/src/Database.js) module
is a subclass of the [Queryable](https://github.com/abw/badger-database-js/blob/master/src/Queryable.js)
module.  This is the base class that implements the
basic [`run()`](basic-queries#run-query-values-options),
[`one()`](basic-queries#one-query-values-options),
[`any()`](basic-queries#any-query-values-options)
and [`all()`](basic-queries#all-query-values-options) methods.

The [Table](https://github.com/abw/badger-database-js/blob/master/src/Table.js)
module is also a subclass of
[Queryable](https://github.com/abw/badger-database-js/blob/master/src/Queryable.js)
so that it also inherits those same basic query methods.

The [Engine](https://github.com/abw/badger-database-js/blob/master/src/Engine.js)
module is used by the
[Queryable](https://github.com/abw/badger-database-js/blob/master/src/Queryable.js)
classes as a lower-level interface to the database.  It handles communicating with the
underlying database driver and provides methods for accessing the connection pool,
preparing and executing queries, and formatting SQL fragments, e.g. quoting columns
and table names, generating  placeholders, etc.

There are three subclasses of the
[Engine](https://github.com/abw/badger-database-js/blob/master/src/Engine.js) module
which are specialised for the different databases supported:
[Sqlite](https://github.com/abw/badger-database-js/blob/master/src/Engine/Sqlite.js),
[Mysql](https://github.com/abw/badger-database-js/blob/master/src/Engine/Mysql.js) and
[Postgres](https://github.com/abw/badger-database-js/blob/master/src/Engine/Postgres.js).

The [Engines](https://github.com/abw/badger-database-js/blob/master/src/Engines.js)
module is an [Engine](https://github.com/abw/badger-database-js/blob/master/src/Engine.js)
provider.  It implements the functionality to allow engines to
be registered and then used by specifying a driver protocol (e.g. `sqlite`, `mysql`,
`mariadb`, `postgres` or `postgresql`).

The [Database](https://github.com/abw/badger-database-js/blob/master/src/Database.js)
module implements the [`table()`](tables) method for
create new [Table](https://github.com/abw/badger-database-js/blob/master/src/Table.js)
objects.  It uses the [Tables](https://github.com/abw/badger-database-js/blob/master/src/Tables.js)
module as a "provider".  This module is ridiculously simply, but it exists
as an extension point so that you can implement your own
[Tables](https://github.com/abw/badger-database-js/blob/master/src/Tables.js) provider
if you want to change the way that table configurations details are defined
(for example, I have a number of projects where the table definitions are in
YAML files that get loaded when the table is first used).

The [Table](https://github.com/abw/badger-database-js/blob/master/src/Table.js)
module is also intended to be an extension point.  It implements
a number of methods providing the basic CRUD functions (Create, Read, Update,
Delete) in various flavours (one, any, all, returning rows or records) that
should cover most basic row-based operations.  When you need to add custom
queries, business logic or other functionality relating to a particular table
then you can create your own subclass of the
[Table](https://github.com/abw/badger-database-js/blob/master/src/Table.js)
module and hook it in.

Various [Table](https://github.com/abw/badger-database-js/blob/master/src/Table.js)
methods have an option to return rows as [records](records).
The base class [Record](https://github.com/abw/badger-database-js/blob/master/src/Record.js)
module provides some basic methods for updating the record, deleting it or
fetching related records.  The more important role is as another extension point.
You can subclass it to create your own record modules where you can add data
validation, business logic or other functionality relating to individual entities.

The [Table](https://github.com/abw/badger-database-js/blob/master/src/Table.js) methods that return records don't return a [Record](https://github.com/abw/badger-database-js/blob/master/src/Record.js)
object directly, but instead return a
[Record Proxy](https://github.com/abw/badger-database-js/blob/master/src/Proxy/Record.js)
wrapper around the record.  This proxy allows you to access the `record.row` components
without having to specify the `.row` part (e.g. `record.id` is short for `record.row.id`)
and also provide access to record relations.

The [Relation](https://github.com/abw/badger-database-js/tree/master/src/Relation)
modules implement the queries to fetch related records for different relation
types:
[one](https://github.com/abw/badger-database-js/blob/master/src/Relation/one.js),
[any](https://github.com/abw/badger-database-js/blob/master/src/Relation/any.js),
[many](https://github.com/abw/badger-database-js/blob/master/src/Relation/many.js) and
[map](https://github.com/abw/badger-database-js/blob/master/src/Relation/many.js).
Most of them are very simple, being no more than 10 lines of code.

The [Builder](https://github.com/abw/badger-database-js/blob/master/src/Builder.js)
module is the base class for components that are used to build SQL queries.
There are numerous subclasses, one for each builder method, e.g.
[Select](https://github.com/abw/badger-database-js/blob/master/src/Builder/Select.js),
[From](https://github.com/abw/badger-database-js/blob/master/src/Builder/From.js),
[Where](https://github.com/abw/badger-database-js/blob/master/src/Builder/Where.js),
[Insert](https://github.com/abw/badger-database-js/blob/master/src/Builder/Insert.js),
[Into](https://github.com/abw/badger-database-js/blob/master/src/Builder/Into.js),
and so on.

The [Builders](https://github.com/abw/badger-database-js/blob/master/src/Builders.js)
module is the provider for `Builder` components, where they can be registered and used.

The [Builder Proxy](https://github.com/abw/badger-database-js/blob/master/src/Proxy/Builder.js)
is a bit of magic sauce that allows one builder component to chain other builder components
onto it.  When you call the `db.select(...)` method, for example, it creates a
[Select](https://github.com/abw/badger-database-js/blob/master/src/Builder/Select.js)
builder component and returns a builder proxy wrapper around it.  When you call the
`from(...)` method on that, it creates a
[From](https://github.com/abw/badger-database-js/blob/master/src/Builder/From.js) builder
components, passing it a reference to the "parent" component that it's attached to,
and returns a builder proxy around that.  And so the process continues...

When you want to run a query built this way, e.g. by calling `run()`, `one()`, `any()`
or `all()`, these methods first call the `sql()` method to generate the query as SQL.
The final builder component in the chain asks its parent for everything it knows about
(the builder context) and then adds its own information to it.  The parent does the
same thing - asking its parent for a context and then adding its own information to it.
So the context requests bubble up the chain, and the context information is then passed
back down.  At each step, a new context object is created so that builder components
don't affect any previous components in the chain.  Once all the context information
has been collected, it's then a relatively simple process of generating the SQL for
each component type (by calling the `generateSQL()` static class method) and then
combining the fragments together in the right order.

When a SQL query has been built using the [query builder](query-builder),
or if you're running a [named query](named-queries) or a raw SQL query,
it is wrapped up as a [Query](https://github.com/abw/badger-database-js/blob/master/src/Query.js)
object before being passed to the [Engine](https://github.com/abw/badger-database-js/blob/master/src/Engine.js) to execute.  This provides a level of
abstraction so that the higher levels don't have to worry about the difference between
running a raw SQL query or a query built using the query builder - the
[Query](https://github.com/abw/badger-database-js/blob/master/src/Query.js) object
takes care of that.  It also deals with combining placeholder values from the query
builder and any that you pass to the query execution methods `run()`, `one()`, `any()`
and `all()`.

The [Transaction](https://github.com/abw/badger-database-js/blob/master/src/Transaction.js)
module is used to run transactions.  It implements methods to handle the `commit()` and
`rollback()` and maintains the state so that it can tell if one or the other has been
called.  It also acquires a dedicated database connection from the
[Engine](https://github.com/abw/badger-database-js/blob/master/src/Engine.js) to ensure
that all queries run within the scope of the transaction use the same connection.

## Conclusion

That's just about all there is to it.  At the time of writing it's around
4,000 lines of code.  That's an order of magnitude less than some of the other
popular Javascript ORMs and SQL query builders out there, and around 30 times
less code than one of the more comprehensive "next generation" ORMs. It is
perhaps not a fair comparison as other libraries may do a lot more than
`badger-database`, but the point is to illustrate that this is one of the
*simpler* and *less intrusive* solutions that exists for adding database
functionality to your project.

It doesn't aim to be a library that you can use as an *alternative* to using SQL
(although that may be true for some simpler projects), but rather to give you tools
that *help* you work with SQL.  In particular, the focus is on automating some of
the simple, boring tasks that are an inherent part of using a database so that you
have time to focus on the more complicated things that are harder to automate.
