# Query Builder

The philosophy of the badger-database library is that ORMs and
SQL query generators are considered *Mostly Harmful*, especially
if they're employed as an alternative to using SQL.  But that's
not to say that they don't have some benefits.

In this section we'll look at the SQL query generators that the
library provides and show how they can help to construct custom
queries, taking care of things like automatically quoting column
and table names, and allowing you to construct queries "out of
sequence".  There are also liberal sprinklings of syntactic sugar
to simplify the code that you need to write to get the job done.

Before we get into too much detail, let's look at some examples.

## Examples

TODO: setup DB, define some tables, examples

TODO: select() and columns() have changed.  select() is no longer
"magical" in automatically scoping columns to the latest table.
But columns() is.

## Starting a Query Chain

The main database object has a `from()` method which allows you to
start a query by specifying a table you want to select from.  You can
then chain further operations like `select()` to specify the columns
that you want to select from the table.

```js
const query = db
  .from('users')
  .select('id name');
```

You can generate SQL for a query by calling the `sql()` method.

```js
const sql = query.sql()
```

For this query it generates the following SQL:

```sql
SELECT "users"."id", "users"."name"
FROM "users"
```

Note how all the column and table names are correctly quoted to
avoid any potential conflicts with reserved words.

The `select()` method can take a string of whitespace delimited column
names and will "Do The Right Thing" to split them up into individual
column names.  These are then combined with the table name to avoid
conflicts between the same column name in multiple tables.

This is an example of the syntactic sugar designed to make your life
that little bit easier when writing code.

Specifying the columns as `id name` is shorthand for either this:

```js
const query = db
  .from('users')
  .select('id', 'name');
```

Or this:

```js
const query = db
  .from('users')
  .select(['id', 'name']);
```

They all do the same thing.  You can also put commas and optional whitespace
between the items in one of these shorthand strings, e.g. `id,name` and
`id, name` are both treated the same as `id name`.

If you want to include raw SQL in your query then you can define
an object with a `sql` property:

```js
const query = db
  .from('users')
  .select({ sql: 'id, name as user_name' });
```

There's a shorthand syntax for this, too.  Import the `sql` function and
use it to create a tagged template literal.

```js
import { sql } from '@abw/badger-database'

const query = db
  .from('users')
  .select(sql`id, name as user_name`);
```

You can specify multiple tables and select columns from each.  The
`select()` method assumes that the columns belong to the table defined
by the most recent `from()` method in the chain.

```js
const query = db
  .from('users')
  .select('id name');
  .from('posts')
  .select('title');
```

This will generate the following SQL:

```sql
SELECT "users"."id", "users"."name", "posts"."title"
FROM "users", "posts"
```

Note that we probably need to add some more to this query (e.g. a
`JOIN` or `WHERE` clause) to make it useful but it demonstrates the
point about how columns are scoped to the most recently defined table.

You can specify multiple tables in a `from()` method, but be warned that
it will be the *last* one that the `select()` method uses to attach columns
to.

```js
const query = db
  .from('users posts')
  .select('title');
```

This generates SQL that binds the `title` column to the `posts` table, because
`posts` is the last table defined.

```sql
SELECT "posts"."title"
FROM "users", "posts"
```

## Running Queries

Call the `all()` method to fetch all rows matching a query.  It's an
asynchronous method so you'll need to `await` the response (or use `.then(...)`
if you prefer).

```js
const rows = await db
  .from('users')
  .select('id name')
  .all();
```

The method returns an array of rows that match the query.

The `any()` method can be used to return a single row.

```js
const row = await db
  .from('users')
  .select('id name')
  .where('id')
  .any([123]);
```

The method will return a single row or `undefined` if it doesn't
match a row.

If you're expecting to get one and only one row returned then use the
`one()` method instead.  This will throw an error if the row isn't
found or if the query returns multiple rows.

The SQL query generated will use placeholders for any `where()` clauses
included.

For example, this query:

```js
const row = db
  .from('users')
  .select('id name')
  .where('id')
```

Will generate a SQL query that looks like this:

```sql
SELECT "users"."id", "users"."name"
FROM "users"
WHERE "users"."id"=?
```

The values for placeholders should be passed as an array to the `all()`, `any()`
and `one()` methods.

TODO: see [where()](#where-criteria-) for information about other ways to
define values.

#The `all()`, `any()` and `one()` methods will automatically provide the values
#for the placeholders (`123` in this case) when the query is run.

## Query Methods

### from(table)

This method can be used to specify the table you want to select from.

```js
const query = db.from('users');
```

You can specify multiple tables using the shorthand syntax as a
string of whitespace delimited table names.

```js
const query = db.from('users companies');
```

Commas (with optional trailing whitespace) between items are also allowed:

```js
const query = db.from('users, companies');
```

You can also specify multiple tables as separate arguments:

```js
const query = db.from('users', 'companies');
```

Or as an array:

```js
const query = db.from(['users', 'companies']);
```

You can create an alias for a table:

```js
const query = db.from({ table: 'users', as: 'people' });
```

You can use raw SQL to define the table name, either by passing
an object with a `sql` property:

```js
const query = db.from({ sql: 'users as people' });
```

Or by using the `sql` function to create a tagged template literal:

```js
import { sql } from '@abw/badger-database'

const query = db.from(sql`users as people`);
```

### select(columns)

This method can be used to specify the columns you want to select.

```js
const query = db
  .from('users')
  .select('id email');
```

The column names are assumed to belong to the table most recently
defined by a [from()](#from-table-)method.  The query shown above
will generate an SQL query like this:

```sql
SELECT "users"."id", "users"."email"
FROM "users"...
```

You can explicitly define the table name if you prefer.  The general
rule is that if a column has a period in it then it won't have the
table name prepended.  However, both the table and columns names will
be automatically quoted.

```js
const query = db
  .from('users companies')
  .select('users.id users.email companies.name');
```

This will generate the following SQL:

```sql
SELECT "users"."id", "users"."email", "companies"."name"
FROM "users", "companies"
```

There are numerous different ways to specify multiple columns.
These all work the same:

```js
db.from('users').select('id email');
db.from('users').select('id,email');
db.from('users').select('id, email');
db.from('users').select('id', 'email');
db.from('users').select(['id', 'email']);
```

You can combine call `from()` and `select()` multiple times to
select columns from different tables.  The `select()` method
will assume that the columns are associated with the most recently
specified table.

```js
const query = db
  .from('users')
  .select('id email')
  .from('companies')
  .select('name')
```

This generates a SQL query like this:

```sql
SELECT "users"."id", "users"."email", "companies"."name"
FROM "users", "companies"
```

You can also connect columns to a different table by passing an
object with `table` and either `columns` or `column` properties.

```js
const query = db
  .from('users companies')
  .select({ table: 'users',     columns: 'id email'})
  .select({ table: 'companies', column: 'name' })
```

You can also do it using a single call to `select()`, like so:

```js
const query = db
  .from('users companies')
  .select(
    { table: 'users',     columns: 'id email'},
    { table: 'companies', column: 'name' }
  )
```

The SQL generated looks like this:

```sql
SELECT "users"."id", "users"."email", "companies"."name"
FROM "users", "companies"
```

You can include the `as` property to define an alias for a column,
either for the current table or one explicitly named using `table`.

```js
const query = db
  .from('users')
  .select({ column: 'name', as: 'user_name' });
```

This generates SQL that looks like this:

```sql
SELECT "users"."name" AS "user_name"
FROM "users"
```

You can include the `prefix` property to add a prefix to all columns.
This can be useful when you have columns with the same name in different
tables.

```js
const op = db
  .from('users companies')
  .select(
    { table: 'users',     columns: 'id name' },
    { table: 'companies', columns: 'id name', prefix: 'company_'}
  );
```

The generated SQL looks like this:

```sql
SELECT "users"."id", "users"."name", "companies"."id" AS "company_id", "companies"."name" AS "company_name"
FROM "users", "companies"
```

You can use raw SQL if you need to, using either the object format with
a `sql` property:

```js
const query = db
  .from('users')
  .select({ sql: 'name as user_name' })
```

Or a `sql` tagged template literal.

```js
const query = db
  .from('users')
  .select(sql`name as user_name`)
```

Finally, you can combine any of the above if you feel so inclined:

```js
const query = db
  .from('users')
  .select('a', 'b c', ['d', 'e'], { column: 'f', as: 'g' }, sql`"h" as "j"`)
```

### where(criteria)

This method can be used to specify the criteria for matching rows.
You can specify one or more columns that you want to match against.

```js
const query = db
  .from('users')
  .select('name email')
  .where('id')
```

Like the [select()](#select-columns-) method, the columns will automatically
be scoped to the most recent table specified by the [from()](#from-table-)
method.  You can explicitly specify the table with each column if you prefer,
or if you want to include a column from a different table, e.g. `users.name`
or `company.name`.  The table and column names will both be quoted automatically.

The generated SQL query will contain a placeholder for the `id` value:

```sql
SELECT "users"."name", "users"."email"
FROM "users"
WHERE "users"."id"=?
```

Values for placeholders should be passed as an array to the `one()`, `any()`
or `all()` methods.

```js
const row = await query.one([123]);
```

You can also provide an object mapping column names to their values if you know
them when constructing the query:

```js
const row = await db
  .from('users')
  .select('id name email')
  .where({ id: 123 })
  .one()
```

The query chain will collect all these values and automatically provide them to
the `one()`, `any()` or `all()` methods.

## join(table)

This method can be used to join tables.

```js
const query = db
  .from('users')
  .select('name email')
  .where('id')
  .join({ table: 'companies', from: 'company_id', to: 'id' })
  .select({ column: 'name', as: 'company_name' })
```


## Chainability

One important benefit of this implementation over some others is
that each step creates a new link in the chain that "points back"
to the previous link that it was created from.  This allows you to
create multiple different queries from links in a chain without
affecting them.

```js
const query0 = db.from('users');
const query1 = query0.select('id name');
const query2 = query0.select('name email');
```

Here `query0`, `query1` and `query2` are all separate query chains.


## Sketchbook - trying out ideas for syntax, arguments, etc

