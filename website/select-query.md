---
outline: deep
---

# Select Query Methods

## select(columns)

This method is used to specify one or more columns that you want to
select.

```js
db.select('id');
// -> SELECT "id"
```

### Multiple Columns Shorthand Form

You can specify multiple columns using the shorthand syntax as a
string of whitespace delimited column names.

```js
db.select('id email');
// -> SELECT "id", "email"
```

Commas (with optional whitespace following) can also be used to
delimit column names.

```js
db.select('id, email');
// -> SELECT "id", "email"
```

### Columns With Table Names

Columns can have the table name included in them.  Both the table
and columns names will be automatically quoted.

```js
db.select('users.id users.email');
// -> SELECT "users"."id", "users"."email"
```

You can specify `*` to select all columns.  This will not be quoted.

```js
db.select('*');
// -> SELECT *
```

You can also use `*` to select all columns from a table.  The table name
will be automatically quoted but the asterisk will not.

```js
db.select('users.*');
// -> SELECT "users".*
```

### Select Columns Object

You can pass an object to the method containing the `columns` property.
The format for the value is either a single column name or multiple columns
delimited with whitespace or commas/whitespace, as shown in the previous
examples.

```js
db.select({ columns: 'id email company.*' });
// -> SELECT "id", "email", "company".*
```

You can also define the `table` as a property to have the table name automatically
added to the column names.

```js
db.select({ table: 'users', columns: 'id email' });
// -> SELECT "users"."id", "users"."email"
```

The `prefix` property can be used to automatically create aliases for the columns.
The prefix will be attached to the front of each column name.

```js
db.select({ columns: 'id email', prefix: 'user_' });
// -> SELECT "id" AS "user_id", "email" AS "user_email"
```

This also works in conjunction with the `table` property.

```js
db.select({ table: 'users', columns: 'id email', prefix: 'user_' });
// -> SELECT "users"."id" AS "user_id", "users"."email" AS "user_email"
```

An object can also contain a `column` item.  In this case it is assumed to
be a single column name which is not split into separate columns.  The optional
`as` property can be provided to create an alias for the column.

```js
db.select({ column: 'email', as: 'email_address' });
// -> SELECT "email" AS "email_address"
```

The `table` property can also be provided in this case.

```js
db.select({ table: 'users', column: 'email', as: 'email_address' });
// -> SELECT "users"."email" AS "email_address"
```

Or you can include the table name in the column.

```js
db.select({ column: 'users.email', as: 'email_address' });
// -> SELECT "users"."email" AS "email_address"
```

### Column Alias Shorthand

The shorthand format for creating a column alias is to pass an array of
either two elements (the column name and alias) or three (the table name,
column name and alias).

```js
db.select(['email', 'email_address' });
// -> SELECT "email" AS "email_address"
```

```js
db.select(['users', 'email', 'email_address' });
// -> SELECT "users"."email" AS "email_address"
```

### Using Raw SQL

You can use raw SQL to define the table columns.  The explicit way is to
pass an object with a `sql` property.

```js
db.select({ sql: '"email" AS "email_address"' });
// -> SELECT "email" AS "email_address"
```

Or you can use the `sql` function to create a tagged template literal.

```js
import { sql } from '@abw/badger-database'
db.select(sql`"email" AS "email_address"`);
// -> SELECT "email" AS "email_address"
```

### Multiple Column Specifications

You can call the method multiple times.  The column names will all be
collected after the `SELECT` keyword.

```js
db.select('id email').select({ table: 'companies', column: 'name', as: 'company_name' });
// -> SELECT "id", "email", "companies"."name" AS "company_name"
```

Or you can pass multiple arguments to a single method call.  Each argument
can be any of the values described above.

```js
db.select('id email', { table: 'companies', column: 'name', as: 'company_name' });
// -> SELECT "id", "email", "companies"."name" AS "company_name"
```

## from(table)

This method is used to specify one or more tables that you want to
select from.

```js
db.from('users');
// -> FROM "users"
```

### Multiple Tables Shorthand

You can specify multiple tables using the shorthand syntax as a
string of whitespace delimited table names.

```js
db.from('users companies');
// -> FROM "users", "companies"
```

Commas (with optional whitespace following) can also be used to
delimit table names.

```js
db.from('users, companies');
// -> FROM "users", "companies"
```

### From Tables Object

You can pass an object to the method containing the `tables` property.
The format for the value is either a single table name or multiple tables
delimited with either whitespace or commas, as shown in the previous
examples.

```js
db.from({ tables: 'users, companies' });
// -> FROM "users", "companies"
```

An object can also contain a `table` item.  In this case it is assumed to
be a single table name is not split into separate table names.  The optional
`as` property can be provided to create an alias for the table.

```js
db.from({ table: 'users', as: 'people' });
// -> FROM "users" AS "people"
```

### Table Alias Shorthand

The shorthand format for creating a table alias is to pass an array of two
elements: the table name and alias.

```js
db.from(['users', 'people']);
// -> FROM "users" AS "people"
```

### Using Raw SQL

You can use raw SQL to define the table name.  The explicit way is to
pass an object with a `sql` property.

```js
db.from({ sql: '"users" AS "people"' });
// -> FROM "users" AS "people"
```

Or you can use the `sql` function to create a tagged template literal.

```js
import { sql } from '@abw/badger-database'
db.from(sql`"users" AS "people"`);
// -> FROM "users" AS "people"
```

### Multiple Table Specifications

You can call the method multiple times.  The tables names will all be
collected after the `FROM` keyword.

```js
db.from(['users', 'people']).from('companies').from({ table: 'employees' })
// -> FROM "users" AS "people", "companies", "employees"
```

Or you can pass multiple arguments to a single method call.  Each argument
can be any of the values described above.

```js
db.from(['users', 'people'], 'companies', { table: 'employees' })
// -> FROM "users" AS "people", "companies", "employees"
```

## where(criteria)

This method can be used to specify the criteria for matching rows.
You can specify one or more columns that you want to match against.

```js
db.select('name email')
  .from('users')
  .where('id')
// -> SELECT "name", "email"
//    FROM "users"
//    WHERE "id" = ?
```

The query will be constructed with placeholders matching the specified
column or columns.

Values for placeholders can be passed as an array to the
[`one()`](#one-values-options), [`any()`](#any-values-options) or
[`all()`](#all-values-options) methods.

```js
const row = await db
  .select('name email')
  .from('users')
  .where('id')
  .one([12345])
```

### Multiple Columns Shorthand

You can specify multiple columns using the shorthand syntax as a
string of whitespace delimited table names.

```js
db.select('name email')
  .from('users')
  .where('id name')
// -> SELECT "name", "email"
//    FROM "users"
//    WHERE "id" = ? AND "name" = ?
```

Commas (with optional whitespace following) can also be used to
delimit column names.

```js
db.select('name email')
  .from('users')
  .where('id, name')
// -> SELECT "name", "email"
//    FROM "users"
//    WHERE "id" = ? AND "name" = ?
```

### Columns With Table Names

Columns can have the table name included in them.  Both the table
and columns names will be automatically quoted.

```js
db.select('name email')
  .from('users')
  .where('users.id')
// -> SELECT "name", "email"
//    FROM "users"
//    WHERE "users"."id" = ?
```

### Defined and Deferred Placeholder Values

You can pass an object to the method mapping column names to their respective values.

```js
const row = await db
  .select('id name email')
  .from('users')
  .where({ id: 12345 })
  .one()      // automatically uses placeholder values: [12345]
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" = ?
```

The query will still be constructed with placeholder values but all the values
will be collected and automatically provided to the
[`one()`](#one-values-options), [`any()`](#any-values-options) or
[`all()`](#all-values-options) methods.
In this case the values would be `[12345]`.

You can pass additional values to those method to provide any additional values.
Be warned that they will always be added *after* values specified in the query.

To illustrate, this will work as intended:

```js
const row = await db
  .select('id name email')
  .from('users')
  .where({ id: 12345 })     // placeholder for id
  .where('name')            // placeholder for name
  .one(['Bobby Badger'])    // placeholder values are [12345, 'Bobby Badger']
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" = ?
//    AND "name" = ?
```

But this won't:

```js
// DON'T DO THIS!
const row = await db
  .select('id name email')
  .from('users')
  .where('name')            // placeholder for name
  .where({ id: 12345 })     // placeholder for id
  .one(['Bobby Badger'])    // WRONG! placeholder values are [12345, 'Bobby Badger']
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "name" = ?
//    AND "id" = ?
```

For this reason it is usually best if you *either* specify all of the values in
the `where()` clauses, *or* pass them all into the `one()`, `any()` or `all()` methods.
This is also particularly relevant if you have a query that includes
[`having()`](#having-criteria) clauses as well.

You can also provide values as an array of `[column, value]`.

```js
const row = await db
  .select('id name email')
  .from('users')
  .where(['id', '12345'])
  .one()            // automatically uses placeholder values: [12345]
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" = ?
```

If you want to see what placeholder values have been collected in a query then you
can call the [`allValues()`](#allvalues) method.

```js
const query = db
  .select('id name')
  .from('users')
  .where({ id: 12345 })

console.log(query.allValues())
// -> [12345]
```

### Using Raw SQL

The column can be raw SQL if necessary.  Either use the
`sql` function to create a tagged template literal or
pass it as an object with a single `sql` property.

```js
const row = await db
  .select('id name email')
  .from('users')
  .where([sql`id + 100`, 102])
  .one()            // automatically uses placeholder values: [102]
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE id + 100 = ?
```

### Comparisons

By default the comparison operator is `=`.  You can provide an array of three
values to set a different comparison operator: `[column, operator, value]`.

```js
db.select('id name email')
  .from('users')
  .where(['id', '>', '12345'])
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" > ?
```

If you want to provide a comparison operator but define the value later then
set the third item to `undefined`.

```js
db.select('id name email')
  .from('users')
  .where(['id', '>', undefined])
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" > ?
```

Or you can define the operator in an array, either with or without a value.

```js
db.select('id name email')
  .from('users')
  .where(['id', ['>', 12345]])
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" > ?
```

```js
db.select('id name email')
  .from('users')
  .where(['id', ['>']])
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" > ?
```

### In and Not In

There's a special case for the `in` and `not in` operators.  Here the query
builder has to know how many items are in the list of candidate values so that
it can generate the appropriate number of placeholders.  So you must pass the
values in as part of the `where` clause.  You can do this using either
a three-element array, where the array of values are passed as the third
element:

```js
db.select('id name email')
  .from('users')
  .where(['id', 'in', [123, 456]])
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" IN (?,?)
```

Or using a two-element array with the array of values nested inside the
second array.

```js
db.select('id name email')
  .from('users')
  .where(['id', ['in' [123, 456]]])
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" IN (?,?)
```

Here are similar queries using `not in`:

```js
db.select('id name email')
  .from('users')
  .where(['id', 'not in', [123, 456]])
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" NOT IN (?,?)
```

```js
db.select('id name email')
  .from('users')
  .where(['id', ['not in' [123, 456]]])
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" NOT IN (?,?)
```

Note that the `in` operator is itself case insensitive, so you can write
it as `in`, `IN`, `In` or even `iN` if you so wish.  However, you can't
write it as `Ni` (or `Peng` or `Neee-Wom` for that matter), even if you
bring a shrubbery to offer as appeasement.

The same rule applies for `not in` which can be written as `NOT IN` or in
any mixture of upper and lower case.

### Comparison Arrays

You can also set a comparison operator using an object by setting the value
to a two element array: `[operator, value]`.

```js
db.select('id name email')
  .from('users')
  .where({ id: ['>', '12345']})
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" > ?
```

Or if you want to provide the value later then use a single element array: `[operator]`.

```js
db.select('id name email')
  .from('users')
  .where({ id: ['>']})
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" > ?
```

The special case for the `in` and `not in` operators also applies here.  The
value must be an array with the array of values provided as the second element.

```js
db.select('id name email')
  .from('users')
  .where({ id: ['in', [123, 456]]})
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" in (?,?)
```

### Raw SQL Comparisons

You can use raw SQL to define the criteria.  The explicit way is to
pass an object with a `sql` property.

```js
db.select('id name email')
  .from('users')
  .where({ sql: 'id > ?' })
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE id > ?
```

Or you can use the `sql` function to create a tagged template literal.

```js
db.select('id name email')
  .from('users')
  .where(sql`id > ?`)
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE id > ?
```

### Multiple Where Specifications

You can call the method multiple times.  The criteria will all be
collected after the `WHERE` keyword and combined with `AND`.

```js
db.select('name email')
  .from('users')
  .where(['id', '>', 12345])
  .where('name')
// -> SELECT "name", "email"
//    FROM "users"
//    WHERE "id" > ? AND "name" = ?
```

Or you can pass multiple arguments to a single method call.  Each argument
can be any of the values described above.

```js
db.select('name email')
  .from('users')
  .where(['id', '>', 12345], 'name')
// -> SELECT "name", "email"
//    FROM "users"
//    WHERE "id" > ? AND "name" = ?
```

### Comparison Functions

An alternative to defining comparisons using the techniques described above
is to use the comparison operator utility functions.  For example, the `gt()`
function creates the correct specification to build a "greater than" comparison

```js
import { gt } from '@abw/badger-database'

db.select('id name email')
  .from('users')
  .where(['id', gt()])
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" > ?  // you must provide the placeholder value
```

If you want to define a value in the query then you can pass it as a parameter.

```js
import { gt } from '@abw/badger-database'

db.select('id name email')
  .from('users')
  .where(['id', gt(1000)])
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" > ?   // 1000 is provided automatically as a placeholder value
```

These also work as values in an object to define comparisons for the
corresponding columns.

```js
import { gt } from '@abw/badger-database'

db.select('id name email')
  .from('users')
  .where({ id: gt(1000), registered: lt('2025') })
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "id" > ?
//    AND "registered" < ?   // 1000 and '2025' provided automatically as placeholder values
```

The basic comparison utility functions are as follows.  These can all take an
argument which will automatically be forwarded as a placeholder value.  If you
don't specify a value as argument then it's up to you to provide it when you
run the query.

* `eq()` - equal to: `=`
* `ne()` - not equal to: `!=`
* `lt()` - greater than: `<`
* `le()` - greater than or equal to: `<=`
* `gt()` - greater than: `>`
* `ge()` - greater than or equal to: `>=`

There are also utility functions for constructing `in` and `not in` criteria.

* `isIn()` - is in list of values: `IN (...)`
* `notIn()` - not in list of values: `NOT IN (...)`

In these cases you must provide the values (either as arguments to the function
or as a single array argument) so that it knows how many placeholders to
insert into the query.

```js
db.select('id name email')
  .from('users')
  .where({ status: in('pending', 'active') })
// -> SELECT "id", "name", "email"
//    FROM "users"
//    WHERE "status" IN (?, ?)  // 'pending' and 'active' provided automatically as placeholder values
```

Here's the same example demonstrating an array being passed as a single argument:

```js
db.select('id name email')
  .from('users')
  .where({ status: in(['pending', 'active']) })
```

The final two comparison functions are for testing is a value is NULL or not.
These do not take any arguments.

* `isNull()` - value is NULL: `IS NULL`
* `notNull()` - value is not NULL: `IS NOT NULL`

```js
db.select('id name')
  .from('users')
  .where({ company_id: isNull() })
// -> SELECT "id", "name",
//    FROM "users"
//    WHERE "company_id" is NULL
```

```js
db.select('id name')
  .from('users')
  .where({ company_id: notNull() })
// -> SELECT "id", "name",
//    FROM "users"
//    WHERE "company_id" is not NULL
```

## join(table)

This method can be used to join tables.

### Shorthand Form

A string can be passed as a shorthand syntax of the form `from = table.to`.
Here `from` is the column you're joining from.  This can include the table
name if necessary to disambiguate (e.g. `users.id`) or can just be the column name
if it's unique (e.g. `id`).  The `table` is the table you're joining onto
and `to` is the column in that table that should match the value in the
`from` column. Spaces are optional around the equals sign, e.g.
`from=table.to` or `from = table.to` are both treated the same.

```js
db.select('users.name users.email')
  .select(['companies.name', 'company_name'])
  .from('users')
  .join('users.company_id = companies.id')
// -> SELECT "users"."name", "users"."email", "companies"."name" AS "company_name"
//    FROM "users"
//    JOIN "companies" ON "users"."company_id" = "companies"."id"
```

For a left join, use a left pointing arrow, e.g. `from <= table.to`.
For a right join, use a right pointing arrow, e.g. `from => table.to`.
For a full join, use a double headed arrow, e.g. `from <=> table.to`.
Spaces around the arrow are optional.

If you want to create an alias for the target table then you can add `as <alias>`
to the end of the string.

```js
db.select('users.name users.email')
  .select(['employer.name', 'company'])
  .from('users')
  .join('users.company_id = companies.id as employer')
// -> SELECT "users"."name", "users"."email", "employer"."name" AS "company"
//    FROM "users"
//    JOIN "companies" AS "employer" ON "users"."company_id" = "employer"."id"
```

### Array Form

You can pass an array to the method containing 2, 3, or 4 elements.
When using two elements, the first should be the table column you're
joining from and the second should be the table column you're joining to.

```js
db.select('users.name users.email')
  .from('users')
  .select(['companies.name', 'company_name'])
  .join(['users.company_id', 'companies.id'])
// -> SELECT "users"."name", "users"."email", "companies"."name" AS "company_name"
//    FROM "users"
//    JOIN "companies" ON "users"."company_id" = "companies"."id"
```

The three element version has the destination table and column separated.

```js
db.select('users.name users.email')
  .from('users')
  .select(['companies.name', 'company_name'])
  .join(['users.company_id', 'companies', 'id'])
// -> SELECT "users"."name", "users"."email", "companies"."name" AS "company_name"
//    FROM "users"
//    JOIN "companies" ON "users"."company_id" = "companies"."id"
```

The four element version allows you to specify the join type at the
beginning.  Valid types are `left`, `right`, `inner` and `full`.

```js
db.select('users.name users.email')
  .from('users')
  .select(['companies.name', 'company_name'])
  .join(['left', 'users.company_id', 'companies', 'id'])
// -> SELECT "users"."name", "users"."email", "companies"."name" AS "company_name"
//    FROM "users"
//    LEFT JOIN "companies" ON "users"."company_id" = "companies"."id"
```

### Join Object

You can pass an object to the method containing the `from`, `table`
and `to` properties, and optionally the `type`.

```js
db.select('users.name users.email')
  .from('users')
  .select(['companies.name', 'company_name'])
  .join({
    type:  'left',
    from:  'users.company_id',
    table: 'companies',
    to:    'id'
  })
// -> SELECT "users"."name", "users"."email", "companies"."name" AS "company_name"
//    FROM "users"
//    LEFT JOIN "companies" ON "users"."company_id" = "companies"."id"
```

Or you can combine the table name and column in the `to` property as you
might for the `from` property.

```js
db.select('users.name users.email')
  .from('users')
  .select(['companies.name', 'company_name'])
  .join({
    type: 'left',
    from: 'users.company_id',
    to:   'companies.id'
  })
// -> SELECT "users"."name", "users"."email", "companies"."name" AS "company_name"
//    FROM "users"
//    LEFT JOIN "companies" ON "users"."company_id" = "companies"."id"
```

You can also use the `as` property to create an alias for the table.

```js
db.select('users.name users.email')
  .from('users')
  .select(['employer.name', 'company'])
  .join({
    from:  'users.company_id',
    table: 'companies',
    as:    'employer'
    to:    'id'
  })
// -> SELECT "users"."name", "users"."email", "employer"."name" AS "company"
//    FROM "users"
//    LEFT JOIN "companies" AS "employer"
//    ON "users"."company_id" = "employer"."id"
```

### Using Raw SQL

You know the drill, right?  If the method doesn't do what you need then you
can use raw SQL to define the joins, either with an object containing a
`sql` property:

```js
db.select('users.name users.email employee.job_title')
  .select(['companies.name', 'company_name'])
  .from('users')
  .join({ sql: 'JOIN employees ON users.id=employees.user_id' })
// -> SELECT "users"."name", "users"."email", "employee"."job_title", "companies"."name" AS "company_name"
//    FROM "users"
//    JOIN employees ON users.id=employees.user_id
```

Or using the `sql` function to create a tagged template literal.

```js
db.select('users.name users.email employee.job_title')
  .select(['companies.name', 'company_name'])
  .from('users')
  .join(sql`JOIN employees ON users.id=employees.user_id`)
// -> SELECT "users"."name", "users"."email", "employee"."job_title", "companies"."name" AS "company_name"
//    FROM "users"
//    JOIN employees ON users.id=employees.user_id
```

### Multiple Join Specifications

Just like the other methods, you can call the method multiple times.

```js
db.select('users.name users.email employee.job_title')
  .select(['companies.name', 'company_name'])
  .from('users')
  .join('users.id = employees.user_id')
  .join('employees.company_id = companies.id')
// -> SELECT "users"."name", "users"."email", "employee"."job_title", "companies"."name" AS "company_name"
//    FROM "users"
//    JOIN "employees" ON "users"."id" = "employees"."user_id"
//    JOIN "companies" ON "employees"."company_id" = "companies"."id"
```

Or you can pass multiple arguments to a single method call.  Each argument
can be any of the values described above.

```js
db.select('users.name users.email employee.job_title')
  .select(['companies.name', 'company_name'])
  .from('users')
  .join('users.id = employees.user_id', 'employees.company_id = companies.id')
// -> SELECT "users"."name", "users"."email", "employee"."job_title", "companies"."name" AS "company_name"
//    FROM "users"
//    JOIN "employees" ON "users"."id" = "employees"."user_id"
//    JOIN "companies" ON "employees"."company_id" = "companies"."id"
```

## order(columns)

This method can be used to create an `ORDER BY` clause.  There's also an
`orderBy()` alias for the method if you prefer something a little closer
in name to the SQL it generates.

### Shorthand Form

A string can be passed containing one or more columns.

```js
db.select('*')
  .from('users')
  .order('name')
// -> SELECT *
//    FROM "users"
//    ORDER BY "name"
```

Columns can be delimited by whitespace or commas, as usual.

```js
db.select('*')
  .from('users')
  .order('name, email')
// -> SELECT *
//    FROM "users"
//    ORDER BY "name", "email"
```

### Columns With Table Name

Columns can include the table name for disambiguation.

```js
db.select('*')
  .from('users')
  .order('users.name users.email')
// -> SELECT *
//    FROM "users"
//    ORDER BY "users"."name", "users"."email"
```

### Sort Order

The default order is `ASC` for "ascending".  To set a different sort
order (e.g. `DESC` for "descending"), pass a two element array with the
columns as the first element and `DESC` as the second.

```js
db.select('*')
  .from('users')
  .order(['name email', 'DESC'])
// -> SELECT *
//    FROM "users"
//    ORDER BY "name", "email" DESC
```

### Order Object

You can also pass an objecting containing the `column` or `columns` property.
The `column` is assumed to be a single column whereas `columns` can contain
multiple columns separated by whitespace or commas in the usual way.  In addition
you can specify either `asc` or `desc` as a boolean flag to set the sort direction
to be ascending or descending, respectively.

```js
db.select('*')
  .from('users')
  .order({ columns: 'name email', desc: true })
// -> SELECT *
//    FROM "users"
//    ORDER BY "name", "email" DESC
```

Or use `direction` (or `dir` for short) set to either `ASC` or `DESC` if you prefer.

```js
db.select('*')
  .from('users')
  .order({ columns: 'name email', dir: 'DESC' })
// -> SELECT *
//    FROM "users"
//    ORDER BY "name", "email" DESC
```

### Using Raw SQL

Of course it also supports raw SQL, either using a `sql` property in an object.

```js
db.select('*')
  .from('users')
  .order({ sql: 'name DESC, email' })
// -> SELECT *
//    FROM "users"
//    ORDER BY name DESC, email
```

Or using a tagged template literal.

```js
db.select('*')
  .from('users')
  .order(sql`name DESC, email`)
// -> SELECT *
//    FROM "users"
//    ORDER BY name DESC, email
```

### Multiple Order Specifications

You can call the method multiple times or pass multiple arguments to it.

```js
db.select('*')
  .from('users')
  .order(['name', 'DESC'], 'email')
// -> SELECT *
//    FROM "users"
//    ORDER BY "name" DESC, "email"
```

## group(columns)

This method can be used to create a `GROUP BY` clause.  There's also a
`groupBy()` alias for it.

### Shorthand Form

A string can be passed containing one or more columns.

```js
db.select(sql`company_id, COUNT(id) AS employees`)
  .from('users')
  .group('company_id')
// -> SELECT company_id, COUNT(id) AS employees
//    FROM "users"
//    GROUP BY "company_id"
```

Multiple columns can be delimited by whitespace or commas and can contain
a table name.

```js
db.select('*')
  .from('users')
  .group('users.company_id, users.start_year')
// -> SELECT *
//    FROM "users"
//    GROUP BY "users"."company_id", "users"."start_year"
```

### Group Object

You can also pass an objecting containing the `column` or `columns` property.
The `column` is assumed to be a single column whereas `columns` can contain
multiple columns separated by whitespace or commas in the usual way.

```js
db.select('*')
  .from('users')
  .group({ columns: 'company_id, year' })
// -> SELECT *
//    FROM "users"
//    GROUP BY "company_id", "year"
```

### Using Raw SQL

As you might expect it also supports raw SQL, either using a `sql` property in an object.

```js
db.select('*')
  .from('users')
  .group({ sql: 'company_id' })
// -> SELECT *
//    FROM "users"
//    GROUP BY company_id
```

Or using a tagged template literal.

```js
db.select('*')
  .from('users')
  .group(sql`company_id`)
// -> SELECT *
//    FROM "users"
//    GROUP BY company_id
```

### Multiple Group Specifications

You can call the method multiple times or pass multiple arguments to it.

```js
db.select('*')
  .from('users')
  .order('company_id', 'start_year')
// -> SELECT *
//    FROM "users"
//    GROUP BY "company_id", "start_year"
```

## having(criteria)

This method works exactly like [`where()`](#where-criteria) but is used to specify the
criteria for matching rows with the `HAVING` keyword.

### Placeholder Value Ordering

One important thing to note is that the `HAVING` clause always appears near the end
of the generated query, coming after the `WHERE` clause.  When you are providing
values for placeholders you should always put the `WHERE` values first followed
by the `HAVING` values.

The query builder allows you to call methods in any order and will automatically
arrange them correctly when building the SQL query.  For example, it is perfectly
valid to call `having()` before `where()`, but you MUST provide the values for the
`where()` clauses before those for the `having()` clauses.

```js
db.select(...)
  .from(...)
  .having('x')
  .where('y')
  .all([yValue, xValue])
// -> SELECT ...
//    FROM ...
//    WHERE "y" = ?
//    HAVING "x" = ?
```

For this reason it is recommended that you put all `where()` clauses before any
`having()` clauses so that you don't confuse yourself.

If you provide values in the `where()` or `having()` clauses then you don't need
to worry.  The query builder automatically collects all `where()` values separately
from `having()` values and passed them to the database engine in the correct order.

```js
db.select(...)
  .from(...)
  .having({ x: xValue })
  .where({ y: yValue })
  .all()            // placeholder values will be [yValue, xValue]
```

You can see what placeholder values have been collected in a query, and the order
that they will appear, in by calling the [`allValues()`](query-execute#allvalues) method.
Note that regardless of the order of method calls, all `where()` placeholder
values comes before `having()` values.

```js
const query = db
  .select('...')
  .from('...')
  .where({ a: 123 })
  .having({ b: 789 })
  .where({ a: 456 })

console.log(query.allValues())
// -> [123, 456, 789]
```

In order to get the placeholder values in the right order, the query builder stores
`where()` values separately from `having()` values.
The [`whereValues()`](query-execute#wherevalues) and
[`havingValues()`](query-execute#havingvalues)
methods all you to inspect them.

```js
console.log(query.whereValues())
// -> [123, 456]
console.log(query.havingValues())
// -> [789]
```

The [`insert()`](insert-query) and [`update()`](update-query) methods also
have their own array for storing values which can be inspected by calling
[`setValues()`](query-execute#setvalues).

## limit(n)

This method can be used to set a `LIMIT` for the number of rows returned.

An integer should be passed to it.

```js
db.select('id name')
  .from('users')
  .limit(10)
// -> SELECT "id", "name"
//    FROM "users"
//    LIMIT 10
```

If you call the method multiple times the previously set value will be overwritten.

```js
db.select('id name')
  .from('users')
  .limit(10)
  .limit(20)
// -> SELECT "id", "name"
//    FROM "users"
//    LIMIT 20
```

## offset(n)

This method can be used to set an `OFFSET` for the number of rows returned.

An integer should be passed to it.

```js
db.select('id name')
  .from('users')
  .offset(10)
// -> SELECT "id", "name"
//    FROM "users"
//    OFFSET 10
```

If you call the method multiple times the previously set value will be overwritten.

```js
db.select('id name')
  .from('users')
  .offset(10)
  .offset(20)
// -> SELECT "id", "name"
//    FROM "users"
//    OFFSET 20
```

## range(from, to)

This method allows you to set both the `LIMIT` and `OFFSET` at once.

### Range Limits

It expects two integers representing the first row you want returned and
the last row.  Note that the numbers start at 0 and the range is *inclusive*.

```js
db.select('id name')
  .from('users')
  .range(50, 59)
// -> SELECT "id", "name"
//    FROM "users"
//    LIMIT 10
//    OFFSET 50
```

If you pass one integer then it is assumed to be the first row you want returned
and there will be no `LIMIT` to the number of rows returned.

```js
db.select('id name')
  .from('users')
  .range(50)
// -> SELECT "id", "name"
//    FROM "users"
//    OFFSET 50
```

### Range Object

You can also provide an object containing `from` and/or `to`.

```js
db.select('id name')
  .from('users')
  .range({ from: 50, to: 59 })
// -> SELECT "id", "name"
//    FROM "users"
//    LIMIT 10
//    OFFSET 50
```

```js
db.select('id name')
  .from('users')
  .range({ from: 50 })
// -> SELECT "id", "name"
//    FROM "users"
//    OFFSET 50
```

```js
db.select('id name')
  .from('users')
  .range({ to: 49 })
// -> SELECT "id", "name"
//    FROM "users"
//    LIMIT 50
```

### Limit and Offset

You can also use it to explicitly set the `limit` and/or `offset`.

```js
db.select('id name')
  .from('users')
  .range({ limit: 10, offset: 50 })
// -> SELECT "id", "name"
//    FROM "users"
//    LIMIT 10
//    OFFSET: 50
```

```js
db.select('id name')
  .from('users')
  .range({ offset: 50 })
// -> SELECT "id", "name"
//    FROM "users"
//    OFFSET 50
```

## columns(columns)

This is just like [`select()`](#select-columns) with one important
distinction.  If you don't explicitly specify a table name then it
will automatically attach the column names to the most recently
specified table.

```js
db.from('users')
  .columns('id email');
// -> SELECT "users"."id", "users"."email"
//    FROM "users"
```

You can interleave it with multiple calls to [`from()`](#from-table)
to access columns from different tables.

```js
db.from('users')
  .columns('id email');
  .from('companies')
  .columns('name');
// -> SELECT "users"."id", "users"."email", "companies"."name"
//    FROM "users"
```

If you specify multiple table names in [`from()`](#from-table) then the
last one will be used.

```js
db.from('companies users')
  .columns('id name');
// -> SELECT "users"."id", "users"."name"
//    FROM "companies", "users"
```

If you specify a table with an alias then the alias will be used.

```js
db.from({ table: "users", as: "people" })
  .columns('id name');
// -> SELECT "people"."id", "people"."name"
//    FROM "users" AS "people"
```

## table(table)

This can be used in conjuction with [`columns()`](#columns-columns) to select
a table to attach columns to.  The table should previously have been specified
using [`from()`](#from-table).

```js
db.from('users companies')
  .table('users').columns('id name')
  .table('companies').columns(['name', 'company_name'])
// -> SELECT "users"."id", "users"."name", "companies"."name" AS "company_name"
//    FROM "users", "companies"
```

## prefix(prefix)

This can be used in conjuction with [`columns()`](#columns-columns) to define
a prefix for subsequent columns.

```js
db.from('users companies')
  .table('users').prefix('user_').columns('id name')
  .table('companies').prefix('company_').columns('name')
// -> SELECT "users"."id" AS "user_id", "users"."name" AS "user_name", "companies"."name" AS "company_name"
//    FROM "users", "companies"
```

You can clear the current prefix by calling `prefix()` without any arguments.

