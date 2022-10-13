# Query Builder

The philosophy of the badger-database library is that ORMs and
SQL query generators are considered *Mostly Harmful*, especially
if they're employed as an alternative to using SQL.  But that's
not to say that they don't have some benefits.  We like to think
that this implementation has some of those best bits and not too
many of the not-so-good bits.

* Correctness - table and column names are automatically quoted to
avoid any conflict with reserved words.

* Syntactic sugar - you can specify multiple tables, columns, etc.,
using a single string for conciseness. You don't need to worry about
defining them as an array, quoting every word or putting commas between
each item.  As long as there's no ambiguity then we take care of that
for you.

* Flexibility - queries can be constructed out of sequence, or you
can call the same methods multiple times.  The query builder makes
sure everything ends up in the right order.  Placeholders are
automatically inserted for user-supplied values to prevent SQL injection
attacks, and in the case of Postgres that uses numbered
placeholders (`$1`, `$2`, `$3`, etc), the query builder takes care
of generating them for you so you don't have to worry about getting
them in the wrong order, repeating a number or skipping one.

* Reusability - unlike some query builders we could mention, these
queries are idempotent.  That is, they generate the same SQL query
each time they are run (although they won't necessarily return the
same rows from the database if you provide different values for
placeholders or your database has been updated in the interim).
Calling a method on a query builder chain doesn't change any of the
elements that precede it.  This means that you can create partial
queries which you can then use to build multiple different queries
that are variations of it.

There are a number of limitations, most of which are intentional.
The first and most prominent is that we currently only support
select queries.  The reasoning behind this is that insert, update
and delete queries are destructive in that they write to the database.
If you get something wrong because the SQL query is obscured by
using a query builder then you're going to have a bad day.  We don't
want you to have a bad day, especially not on our account.

As described in the [tables](manual/tables.html) documentation,
there are already methods provided for inserting, updating and
deleting records and they come with a safety net.  You can mark
table columns as `required` and/or `readonly` and the method calls
will be sanity checked for you.  An error will be thrown if you
try to insert or update `readonly` columns, or insert records
with missing `required` columns.

If you need to perform an insert, update or delete query that
is any more complicated than that (e.g. requiring a join to another
table) then we highly recommend that you write it as an SQL query
that you can test (on a sacrificial copy of your production database,
of course) and then define as a [named query](manual/named_queries.html).

Another limitation is that we don't support all the SQL elements that
you could possibly want to put in a select query.  Again, this is
deliberate.  We've tried to cover the things that you're likely to
need most often, and provide an easy way to embed raw SQL for those
times when you need something else.  This library does not try
to discourage you from using SQL when you need to.  In fact, it
positively encourages you to do so.

Before we get into too much detail, let's look at some examples.

## Getting Started

We'll start off by importing the `connect` and `sql` functions
and connecting to a database.  The wrapper code would look something
like this:

```js
import { connect, sql } from '@abw/badger-database'

async function main() {
  const db = connect({ database: 'sqlite:memory' });

  // examples go here
}

main()
```

When you create a query, or part of a query, you can call the
`sql()` method to see what the generated SQL looks like.

```js
console.log(
  db.select('hello').from('world').sql()
);  // -> SELECT "hello" FROM "world"
```

In these examples we'll omit the `console.log()` and `sql()` call
for brevity.

## Selecting Columns From Tables

The main database object has a `select()` method which allows you to
start a query by specifying the columns you want to select.  You can
then chain further methods onto it, e.g. `from()` to specify one or
more tables that you want to select from.

```js
db.select('hello').from('world')
// -> SELECT "hello" FROM "world"
```

Table and column names are both automatically quoted to avoid conflict
with reserved words.  Even if they're not reserved words *now*, there's
always the possibility that they could be in the *future*.  In fact this
happened to me on a project where we updated MySQL and discovered that
`rank` had become a reserved word - we had numerous tables with a `rank`
column and it took several hours to go through all the various queries
we used to quote the column.  Lesson learned.

When you pass a string to either of these methods (and many others),
the string will be split into individual table or columns names.  These
will then be quoted and put back together.

```js
db.select('id name').from('users')
// -> SELECT "id", "name" FROM "users"
```

You can put commas between items (with optional trailing whitespace)
and it works the same, e.g `id,name` and `id, name` are both treated
the same as `id name`.

```js
db.select('id, name').from('users')
// -> SELECT "id", "name" FROM "users"
```

You can add table names to columns.  Both will be automatically quoted.

```js
db.select('users.id users.name').from('users')
// -> SELECT "users"."id", "users"."name" FROM "users"
```

You can also start with the `from()` method if you like.  Generally
speaking, it doesn't matter which order you call methods in.  The query
builder will construct the SQL query in the correct order.

```js
db.from('users').select('id name')
// -> SELECT "id", "name" FROM "users"
```

NOTE: We don't yet have support for `with()` but it should be coming soon.
When it does, we will also allow you to start a query with that.

If you want to start a query with anything other than `select()` or `from()`
(or `with()`, coming soon), then you should prefix it with a call to
`builder()`.

You can call methods multiple times.

```js
db.select('id').select('name').from('users')
// -> SELECT "id", "name" FROM "users"
```

You can also call methods out of order.  The query builder takes
care of putting everyting back in the right order.

```js
db.select('id').from('users').select('name')
// -> SELECT "id", "name" FROM "users"
```

You can also pass multiple arguments to a method.  Each is processed
in turn as if you had called the method multiple times.  We'll see how
this can be useful with more complex parameters.

```js
db.select('id', 'name').from('users')
// -> SELECT "id", "name" FROM "users"
```

For example, the `select()` method allows you to pass an array of
two element.  The first is the column name, the second is an alias.

```js
db.select(['name', 'user_name']).from('users')
// -> SELECT "name" AS "user_name" FROM "users"
```

The `from()` method supports the same syntax for creating a table alias.

```js
db.select('name').from(['users', 'people'])
// -> SELECT "name" FROM "users" AS "people"
```

You can also pass objects to the methods to provide named parameters.

```js
db.select({ column: 'name', as: 'user_name' }).from('users')
// -> SELECT "name" AS "user_name" FROM "users"
```

Here's an example showing how you can automatically add the table name to
columns and add a prefix to the returned values.

```js
db.select({ table: 'users', columns: 'id name', prefix: 'user_' }).from('users')
// -> SELECT "users"."id" AS "user_id", "users"."name" AS "user_name" FROM "users"
```

You can use any of the argument types for a method and you can mix and match them
in a single call.

```js
db.select('id', { table: 'users', columns: 'name email', prefix: 'user_' }).from('users')
// -> SELECT "id", "users"."name" AS "user_name", "users.email" as "user_email" FROM "users"
```

## Embedding Raw SQL

The query builder tries to hit the sweet spot by allowing you to generate
*most* of the simpler queries you might need.  But it doesn't supporting
everything that SQL has to offer because that would greatly increase the
complexity and make it harder to reason about.

As a fallback plan, every method allows you to provide it with raw SQL.
You can pass an object with a single `sql` property:

```js
db.select({ sql: 'COUNT(user.id) AS n_users' }).from('users')
// -> SELECT COUNT(user.id) AS n_users FROM "users"
```

Or you can use the `sql` function to generate a tagged template literal.

```js
db.select(sql`COUNT(user.id) AS n_users`).from('users')
// -> SELECT COUNT(user.id) AS n_users FROM "users"
```

The benefit here is that you can use SQL for some parts of a query when you
need it, but still rely on the convenience of automatic generation for
other parts that don't.

## Placeholder Values

The `where()` method is used to specify selection criteria.  Any user
supplied values are embedded into the query using placeholders.

The SQL query generated will use placeholders for any `where()` clauses
included.

For example, this query:

```js
db.select('id name')
  .from('users')
  .where('id')
```

Will generate a SQL query that looks like this:

```sql
SELECT "id", "name"
FROM "users"
WHERE "id"=?
```

You can also define values in the `where()` clause.

```js
const row = db
  .from('users')
  .select('id name')
  .where({ id: 12345 })
  .one();     // automatically uses placeholder values: [12345]
```

The query generated will still use placeholders.  It will also
automatically keep track of the values that go with each placeholder.

## Running Queries

When you've constructed a query you can add the `all()` method to the end to
fetch all rows matching the query.  It's an asynchronous method so you'll need
to `await` the response (or use `.then(...)` if you prefer).

```js
const rows = await db
  .select('id name')
  .from('users')
  .all();
```

The method returns an array of rows that match the query.

The `any()` method can be used to return a single row.

```js
const row = await db
  .select('id name')
  .from('users')
  .where({ id: 12345 })
  .any();
```

The method will return a single row or `undefined` if it doesn't
match a row.

If you're expecting to get one and only one row returned then use the
`one()` method instead.  This will throw an error if the row isn't
found or if the query returns multiple rows.

You can provide values for placeholders in `where()` clauses as shown
above, or you can save them all up and pass them as an array to the
`one()`, `any()` or `all()` methods.

```js
const row = await db
  .select('id name')
  .from('users')
  .where('id')
  .any([12345]);
```

## The Importance of Being Idempotent

One benefit of this implementation over some others is that the query
builder chains are *idempotent*.  That's a fancy way of saying that
adding new links in the chain doesn't affect any of the previous links.

What this means in practice is that you can create a "base" query that
you can use to build other queries from.  Each query exists in its own
independent world and doesn't affect any other.

Consider this query to fetch employees of a company by joining from the
`users` table to the `employees` table and then onto the `companies` table.

```js
const employees = db
  .select(
    'users.name employees.job_title',
    ['companies.name', 'company_name']  // alias company.name to company_name
  )
  .from('users')
  .join('users.id=employees.user_id')
  .join('employees.company_id=companies.id')
```

We can then use that as the basis to construct a number of other queries.
For example, to fetch an employee by user id:

```js
const row = await employees
  .where('users.id')
  .one([12345])
```

Or to fetch all employees for a company:

```js
const rows = await employees
  .where('companies.id')
  .one([98765])
```

Or to fetch all employees with a particular job title:

```js
const rows = await employees
  .where('employees.job_title')
  .all(['Chief Badger'])
```

Each query is entirely independent from the others.

Furthermore, the fact that the query builder allows you to call methods
out of sequence means that you're not limited to tagging new method calls
onto the end of the base query.  For example, you can `select()` additional
columns in one of the new queries if there's something extra you need that
isn't in the base query.

```js
const rows = await employees
  .select('user.id')
  .where('employees.job_title')
  .all(['Chief Badger'])
```
