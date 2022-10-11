# Query Builder

The philosophy of the badger-database library is that ORMs and
SQL query generators are considered *Mostly Harmful*, especially
if they're employed as an alternative to using SQL.  But that's
not to say that they don't have some benefits.

* Correctness - automatically quoting table and column names

* Flexibility - constructing queries out of sequence

* Reusability - unlike some query builders, these are idempotent.
You can create a "base" query and then build new queries off it.

* Syntactic sugar -

Before we get into too much detail, let's look at some examples.

## Examples

TODO: setup DB, define some tables, examples

TODO: select() and columns() have changed.  select() is no longer
"magical" in automatically scoping columns to the latest table.
But columns() is.

NOTE: code has been updated since this was written so it will be
wrong in places

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



