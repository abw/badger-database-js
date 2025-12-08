# Query Builder

This page gives a general introduction to generating and running queries
using the SQL Query Builder.

## Introduction

The philosophy of the badger-database library is that ORMs and
SQL query generators are considered *Mostly Harmful*, especially
if they're employed as an alternative to using SQL.  But that's
not to say that they don't have some benefits.  We like to think
that this implementation has some of those best bits and not too
many of the not-so-good bits.

* **Correctness** - table and column names are automatically quoted to
avoid any conflict with reserved words.

* **Syntactic sugar** - you can specify multiple tables, columns, etc.,
using a single string for conciseness. You don't need to worry about
defining them as an array, quoting every word or putting commas between
each item.  As long as there's no ambiguity then we take care of that
for you.

* **Flexibility** - queries can be constructed out of sequence, or you
can call the same methods multiple times.  The query builder makes
sure everything ends up in the right order.  Placeholders are
automatically inserted for user-supplied values to prevent SQL injection
attacks, and in the case of Postgres that uses numbered
placeholders (`$1`, `$2`, `$3`, etc), the query builder takes care
of generating them for you so you don't have to worry about getting
them in the wrong order, repeating a number or skipping one.

* **Reusability** - unlike some query builders we could mention, these
queries are idempotent.  That is, they generate the same SQL query
each time they are run (although they won't necessarily return the
same rows from the database if you provide different values for
placeholders or your database has been updated in the interim).
Calling a method on a query builder chain doesn't change any of the
elements that precede it.  This means that you can create partial
queries which you can then use to build multiple different queries
that are variations of it.

The query builder is intended to be used to generate simpler queries
that can be automated, or are otherwise tedious to write by hand.
For example, the [tables](/tables) use the query builder
to automatically generate queries for selecting, inserting, updating
and deleting records.  In addition, they provide some extra data
validation.  You can mark table columns as `required` and/or `readonly`
and the method calls will be sanity checked for you.  An error will
be thrown if you try to insert or update `readonly` columns, or
insert records with missing `required` columns.

It is possible to use the query builder to generate more complex
queries involving multi-table joins, sub-queries, and so on.  However,
you should exercise caution when doing so.  Make sure to check the
generated output using the [sql()](/builder-methods#sql) method to convince
yourself that it's generating the SQL that you expect.  In the long run you
may find it easier and more reliable to write complex queries as raw SQL
that you can test (on a sacrificial copy of your production database, of
course) and then define as a [named query](named-queries).

The query builder has some limitations in that it doesn't support all
the SQL elements that you could possibly want to put in a query.
This is *probably* deliberate.  We've tried to cover the things that
you're likely to need most often, and provide an easy way to embed raw
SQL for those times when you need something else.  This library does
not try to discourage you from using SQL when you need to.  In fact,
it positively encourages you to do so.

Before we get into too much detail, let's look at some examples.

## Getting Started

We'll start off by importing the `connect` and `sql` functions
and connecting to a database.  The wrapper code would look something
like this:

```js
import { connect, sql } from '@abw/badger-database'

const db = connect({ database: 'sqlite:memory' });

// examples go here

db.disconnect()
```

The database object provides four methods for creating different
query types.  There are separate documentation pages describing each of
them in detail.

* [`select()`](select-query)
* [`insert()`](insert-query)
* [`update()`](update-query)
* [`delete()`](delete-query)

In this page we'll give you a basic overview of each of them without going
into too much nitty-gritty detail.

## Basic Examples

Here's an example of a [`select()`](select-query) query.

```js
const row = await db
  .select('name email')
  .from('users')
  .where({ id: 12345 })
  .one();
```

Here's an [`insert()`](insert-query) query.

```js
await db
  .insert('name email')
  .into('users')
  .values('Bobby Badger', 'bobby@badgerpower.com')
  .run();
```

Here's an [`update()`](update-query) query.

```js
await db
  .update('users')
  .set({ name: 'Roberto Badger' })
  .where({ email: 'bobby@badgerpower.com' })
  .run();
```

And here's a [`delete()`](delete-query) query.

```js
await db
  .delete()
  .from('users')
  .where({ email: 'bobby@badgerpower.com' })
  .run();
```

When you create a query, or part of a query, you can call the
[`sql()`](query-execute#sql) method to see what the
generated SQL looks like.

```js
console.log(
  db.select('hello').from('world').sql()
);  // -> SELECT "hello" FROM "world"
```

In these examples we'll omit the `console.log()` and
[`sql()`](query-execute#sql) calls for brevity.

## Select Queries

The main database object has a
[`select()`](select-query) method which
allows you to start a query by specifying the columns you want to select.
You can then chain further methods onto it, e.g.
[`from()`](select-query#from-table) to specify one or
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

Generally speaking, it doesn't matter which order you call methods in.
The query builder will construct the SQL query in the correct order.

```js
db.select('name').where({ id: 12345 }).from('users')
// -> SELECT "name" FROM "users" WHERE id = ?
```

If you want to start a query with anything other than
[`select()`](select-query),
[`insert()`](insert-query),
[`update()`](update-query),  or
[`delete()`](delete-query)
then you should prefix it with `.build`.

```js
db.build.where('c').from('b').select('a')
// -> SELECT "a" FROM "b" WHERE "c" = ?
```

You can call methods multiple times.

```js
db.select('id').select('name').from('users')
// -> SELECT "id", "name" FROM "users"
```

You can also pass multiple arguments to a method.  Each is processed
in turn as if you had called the method multiple times.  We'll see how
this can be useful with more complex parameters.

```js
db.select('id', 'name').from('users')
// -> SELECT "id", "name" FROM "users"
```

For example, the
[`select()`](select-query)
method allows you to pass an array of
two elements.  The first is the column name, the second is an alias.

```js
db.select(['name', 'user_name']).from('users')
// -> SELECT "name" AS "user_name" FROM "users"
```

The [`from()`](select-query#from-table) method
supports the same syntax for creating a table alias.

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

## Insert Queries

Use the
[`insert()`](insert-query)
method to start an `INSERT` query.  The arguments it expects are the names
of the columns you're inserting.  You should follow that with the
[`into()`](insert-query#into-table) method to specify the table
you're inserting into.  Values for the columns can be provided via the
[`values()`](insert-query#values-values) method, either as
separate arguments or an array.

```js
await db
  .insert('name email')
  .into('users')
  .values('Bobby Badger', 'bobby@badgerpower.com')
  .run();
// -> INSERT INTO "users" ("name", "email")
//    VALUES (?, ?)
```

Or you can pass an array of values as the first argument to the
[`run()`](query-execute#run-values-options) method.
This is useful when you want to reuse the query to insert multiple rows.

```js
const insert = db
  .insert('name email')
  .into('users');

await insert.run(['Bobby Badger', 'bobby@badgerpower.com'])
await insert.run(['Brian Badger', 'brian@badgerpower.com'])
await insert.run(['Frank Ferret', 'frank@ferretfactory.com'])
```

The second argument to the
[`run()`](query-execute#run-values-options) method can be
an object containing options.  The `sanitizeResult` option is useful if
you want to inspect the result of the insert operation.

```js
const result = await insert.run(
  ['Bobby Badger', 'bobby@badgerpower.com'],
  { sanitizeResult: true }
);
console.log("Changes:", result.changes)
console.log("Inserted ID:", result.id)
```

If you're using Postgres then you should use the
[`returning()`](insert-query#returning-columns) method
to add a `RETURNING` clause on the end of the query to get the
inserted ID returned.

```js
const insert = await db
  .insert('name email')
  .into('users')
  .returning('id')
```

## Update Queries

Use the
[`update()`](update-query) method to start an
`UPDATE` query.  The argument it expects is the name of the table that you're
updating.  You should follow that with the
[`set()`](update-query#set-values) method to specify the changes
you want to make, and optionally, a
[`where()`](select-query#where-criteria) clause to define which
rows you want to change.

The [`set()`](update-query#set-values) and
[`where()`](select-query#where-criteria) methods can be passed a list
of column names with the values being provided to the
[`run()`](query-execute#run-values-options) method:

```js
await db
  .update('users')
  .set('name')
  .where('email')
  .run(['Robert Badger', 'bobby@badgerpower.com']);
// -> UPDATE "users"
//    SET name = ?
//    WHERE email = ?
```

Or you can provide values directly to the
[`set()`](update-query#set-values) and/or
[`where()`](select-query#where-criteria) methods.  In both
cases placeholders are used for the values so the SQL generated is identical.

```js
await db
  .update('users')
  .set({ name: 'Robert Badger' })
  .where({ email: 'bobby@badgerpower.com' })
  .run();
// -> UPDATE "users"
//    SET name = ?
//    WHERE email = ?
```

## Delete Queries

Use the [`delete()`](delete-query) method to start a
`DELETE` query.  It usually doesn't take any arguments but should be followed
with a [`from()`](select-query#from-table) call to set the
name of the table that you're deleting from, and optionally, a
[`where()`](select-query#where-criteria)
clause to define which rows you want to delete.

```js
await db
  .delete()
  .from('users')
  .where({ email: 'bobby@badgerpower.com' })
  .run()
// -> DELETE FROM "users"
//    WHERE "email" = ?
```

This also allows you to define parameter values in the
[`where()`](select-query#where-criteria) method, as
shown above, or specify columns names in the
[`where()`](select-query#where-criteria) method and pass all
values as an array to the [`run()`](query-execute#run-values-options)
method.

```js
await db
  .delete()
  .from('users')
  .where('email')
  .run(['bobby@badgerpower.com'])
// -> DELETE FROM "users"
//    WHERE "email" = ?
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

The [`where()`](select-query#where-criteria) method is used to specify
selection criteria.  Any user supplied values are embedded into the query using
placeholders.

The SQL query generated will use placeholders for any
[`where()`](select-query#where-criteria) clauses included.

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

You can also define values in the [`where()`](select-query#where-criteria)
clause.

```js
const row = db
  .select('id name')
  .from('users')
  .where({ id: 12345 })
  .one();     // automatically uses placeholder values: [12345]
```

The query generated will still use placeholders.  It will also
automatically keep track of the values that go with each placeholder.

If you want to see what placeholder values a query has collected then
you can call the [`allValues()`](query-execute#allvalues) method.

```js
const query = db
  .select('id name')
  .from('users')
  .where({ id: 12345 })

console.log(query.allValues())
// -> [12345]
```

The query builder also provides a [`having()`](select-query#having-criteria)
method which works in a similar way.  The query builder collects placeholder values
associated with `WHERE` clauses separately from those associated with `HAVING` clauses.
This is because any `WHERE` clauses come before any `HAVING` clauses and the placeholder
values must be ordered in that way.

You can call the [`whereValues()`](query-execute#wherevalues) and
[`havingValues()`](query-execute#havingvalues) methods to see what values have
been collected for them separately.

```js
console.log(query.whereValues())
// -> [12345]
console.log(query.havingValues())
// -> []
```

If you're building an [`insert()`](insert-query)
or [`update()`](update-query) query then you may also
have [`setValues()`](query-execute#setvalues) defined.
This will contain placeholders values provided via
the [`values()`](insert-query#values-values) or
[`set()`](update-query#set-values) methods.
For [`select()`](select-query)
queries this list will be empty.

```js
console.log(query.setValues())
// -> [ ]
```

The [`allValues()`](query-execute#allvalues) method returns a
concatenated list of all the
[`setValues()`](query-execute#setvalues),
[`whereValues()`](query-execute#wherevalues) and
[`havingValues()`](query-execute#havingvalues),
*in that order*.

Instead of baking placeholder values into a query using the above methods you can
provider them all in one go when you run the query.

## Running Queries

When you've constructed a query you can call the
[`run()`](query-execute#run-values-options) method to execute
the query. This is used for queries that aren't expected to return any rows
from the database, e.g. for `INSERT`, `UPDATE` or `DELETE` queries.  It's an
asynchronous method (as are all the other execution methods) so you'll need
to `await` the response (or use `.then(...)` if you prefer).

```js
await db
  .delete()
  .from('users')
  .where({ id: 12345 })
  .run();
```

The [`all()`](query-execute#all-values-options) method can be used
to fetch all rows matching the query.  It will return an array of objects
containing the data for each row.

```js
const rows = await db
  .select('id name')
  .from('users')
  .all();
console.log(rows.length, 'rows returned')
```

The [`any()`](query-execute#any-values-options)
method can be used to return a single row.  The method will return
an object containing the row data or `undefined` if it doesn't match a row.

```js
const row = await db
  .select('id name')
  .from('users')
  .where({ id: 12345 })
  .any();
console.log(row ? 'got a row' : 'row not found')
```

If you're expecting to get one and only one row returned then use the
[`one()`](query-execute#one-values-options) method instead.
This will throw an error if the row isn't found or if the query returns
multiple rows.

```js
const row = await db
  .select('id name')
  .from('users')
  .where({ id: 12345 })
  .any();
console.log('got a row:', row)
```

You can provide values for placeholders when you're building queries,
as shown in the exampels above.  Or you can save them all up and pass
them as an array to the
[`run()`](query-execute#run-values-options),
[`one()`](query-execute#one-values-options),
[`any()`](query-execute#any-values-options) or
[`all()`](query-execute#all-values-options) methods.

```js
const row = await db
  .select('id name')
  .from('users')
  .where('id')
  .any([12345]);
```

Although it's possible to provide some placeholder values in methods where
you're building the query (e.g. in [`where()`](select-query#where-criteria))
and others when you run the query (e.g. in
[`all()`](query-execute#all-values-options)), you do have to be
careful to ensure the placeholder values end up in the right order.

When the query is executed, the default order for placeholder values is the
concatenation of
[`setValues()`](query-execute#setvalues),
[`whereValues()`](query-execute#wherevalues),
[`havingValues()`](query-execute#havingvalues),
and finally any values you provide to the execution methods:
[`run()`](query-execute#run-values-options),
[`one()`](query-execute#one-values-options),
[`any()`](query-execute#any-values-options) or
[`all()`](query-execute#all-values-options).

If you need to re-arrange the order of placeholder values then you can
pass a function to any of the query execution methods.  This will be
passed three arrays: the
[`setValues()`](query-execute#setvalues),
[`whereValues()`](query-execute#wherevalues) and
[`havingValues()`](query-execute#havingvalues).  Your
function should return an array containing the concatenated values
including any other placeholder values you need to provide.

```js
const row = await db
  .select('id name')
  .from('users')
  .where('id')
  .any(
    // add any other placeholder values into the returned array
    (sv, wv, hv) => [...sv, ...wv, ...hv]
  );
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
    ['companies.name', 'company_name']  // alias companies.name to company_name
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
onto the end of the base query.  For example, you can
[`select()`](select-query) additional
columns in one of the new queries if there's something extra you need that
isn't in the base query.

```js
const rows = await employees
  .select('users.id')
  .where('employees.job_title')
  .all(['Chief Badger'])
```


## Named Queries

You can define [named queries](named-queries) that use the query
builder to generate the SQL.

The named query should be defined as a function.  It will be passed a reference
to the database and should return a query generated using the query builder.

```js
const db = connect({
  database: 'sqlite:memory',
  queries: {
    selectUserByName:
      db => db
        .select('name email')
        .from('users')
        .where('name')
  }
});
```

You can then use the named query just like any other named query.

```js
const bobby = await db.one(
  'selectUserByName',
  ['Bobby Badger']
);
```

You can use the [`query()`](named-queries#query-name) method to fetch a named
query.  If it's constructed using the query builder then you can call further
methods on it to create a more specialised query.  Remember, the original named
query won't be affected so it's perfectly safe to do this.

```js
const bobby = await db
  .query('selectUserByName')
  .select('id')   // also select user id
  .one(['Bobby Badger']);
```

You can even do this to create named queries based on other named queries.

```js
const db = connect({
  database: 'sqlite:memory',
  queries: {
    // "base" query to select a user
    selectUser:
      db => db
        .select('name email')
        .from('users')  // SELECT "name", "email" FROM "users"

    // specialised version to select a user by name
    selectUserByName:
      db => db
        .query('selectUser')
        .where('name')  // SELECT "name", "email" FROM "users" WHERE "name" = ?

    // specialised version to select a user by email
    selectUserByName:
      db => db
        .query('selectUser')
        .where('email') // SELECT "name", "email" FROM "users" WHERE "email" = ?
  }
});

const bobby = db.one(
  'selectUserByName',
  ['Bobby Badger']
);

const brian = db.one(
  'selectUserByEmail',
  ['brian@badgerpower.com']
);
```

You can provide parameters in named queries and they will be "remembered" when
you come to run the query.

```js
const db = connect({
  database: 'sqlite:memory',
  queries: {
    fetchAllBadgers:
      db => db
        .select('name email')
        .from('users')
        .where({ animal: 'Badger' })
  }
});

const badgers = await db.all('fetchAllBadgers')
```

The [`sql()`](query-execute#sql) method can be used to view the SQL generated by a named
query builder.

```js
db.sql('fetchAllBadgers')
// -> SELECT "name", "email"
//    FROM "users"
//    WHERE "animal" = ?
```

If you want to see what placeholder values the query has got defined then
you can call the [`allValues()`](query-execute#allvalues) method.

```js
db.query('fetchAllBadgers').allValues()
// -> ['Badger']
```

Placeholder values are stored in three separate arrays internally: one
for any values being set via an [`insert()`](insert-query)
or [`update()`](update-query) query
([`setValues()`](update-query#set-values)),
another for any values set via [`where()`](select-query#where-criteria)
([`whereValues()`](query-execute#wherevalues)),
and the third for values set via
[`having()`](select-query#having-criteria)
([`havingValues()`](query-execute#havingvalues)).
The [`allValues()`](query-execute#allvalues)
method returns the concatenation of these three arrays.

```js
const q = db.query('fetchAllBadgers')
q.setValues()     // -> []
q.whereValues()   // -> ['Badger']
q.havingValues()  // -> []
```

## Where Next?

In the next section we'll go over the
[query builder methods](builder-methods) in detail.
