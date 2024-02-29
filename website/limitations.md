# Limitations

The scope of the library is, quite deliberately, limited.

The [query builder](query-builder) allows you to
construct *many* of the simpler select queries that you might need,
but certainly not *every* SQL query that you could imagine.

There's no built-in support for subqueries, for example, but you
can still define them using raw SQL fragments if you want to.
That said, for more complex queries you might be better off writing
them entirely in SQL and saving them as
[named queries](named-queries).

That gives you the benefit of having a "pure" SQL query that
you can write, test, inspect and amend, without having to translate
it back and forth between the query builder methods.  Making it a
named query allows it to be hidden away somewhere in a library file
so that your application code can remain simple and treat it like a
black box.

The support for [relations](relations) has some
shortcomings.  For example, you can't define many-to-many relations that
use intermediate link tables. However, you can define your own load method
with a custom SQL query when you need to.

These are all deliberate design decision.  Supporting everything that
is possible in SQL would require a full-blown ORM or SQL query generator
with all the problems that they bring.

The library aims to hit the 90/10 sweet spot, where it handles 90% of
trivial tasks that can easily be automated, leaving the remaining 10%
(which would take 90% of the effort to implement) up to you.

Instead, the library makes it easy for you to define named queries and
custom table or record methods so that you can use the full power of SQL
behind the scenes, without having to embed SQL directly into your
application code.

This approach also makes it easier for the SQL expert in your team (if
you have one), to take responsibility for building and maintaining your
database abstraction layer, allowing other developers to treat it more
like a black box, accessing the complex functionality hidden behind the
scenes through simple method calls.  Even if you don't have an SQL expert,
the fact that the library supports and encourages the use of SQL queries
makes it easier to cut and paste examples from Stack Overflow without
having to first translate the SQL into the right calls to a query generator.
(NOTE: please don't use queries from Stack Overflow without first reading
through them, understanding how they work, adapting them as necessary
and then testing them thoroughly on a sacrifical copy of your production
database).

SQL is powerful.  SQL is portable.  SQL is (nearly always) the solution
if the library doesn't already do what you want.


