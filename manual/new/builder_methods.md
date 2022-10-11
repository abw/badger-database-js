# Query Builder Methods

This page describes all the query builder methods.

TODO: common functionality: single string may have some "magic".
Object argument is the explicit form.  { sql: xxx } or sql`xxx`
for raw SQL.

Multiple arguments are process in turn, same as calling method
multiple times.

## from(table)

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

## select(columns)

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

## where(criteria)

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


## Sketchbook - trying out ideas for syntax, arguments, etc

