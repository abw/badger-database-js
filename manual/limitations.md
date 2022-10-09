# Limitations

The scope of the library is, quite deliberately, limited.

The table methods to insert, update, select and delete rows,
for example, are intended to automate *most* of the trivial queries
that you might want to perform, but there will undoubtedly be cases
where they fall short.

You can't select, update or delete rows using a JOIN onto another
table, for example.  Nor can you select rows using subqueries or
temporary tables.  Aliases for selecting columns aren't support at
the time of writing (although they might be by the time you read this).

Similarly, the support for relations has some shortcomings.  For example,
you can't define many-to-many relations that use intermediate link
tables (although you can define your own load method to do that).

These are all deliberate design decision.  Supporting everything that
is possible in SQL would require a full-blown ORM or SQL query generator
with all the problems that they bring.

The library aims to hit the 90/10 sweet spot, where it handles 90% of
trivial tasks that can easily be automated, leaving the remaining 10%
(which would take 90% of the effort) up to you.

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

SQL is powerful.  SQL is portable.  SQL is (nearly always) the solution
if the library doesn't already do what you want.


