---
outline: deep
---

# Query Execution Methods

## run(values, options)

This method can be used to run query where you're not expecting to get
any rows returned.  This is typically used for [`insert()`](insert-query),
[`update()`](#update-query) and [`delete()`](#delete-query) queries.

If you have any placeholders in the query that you haven't already defined
values for then you should provide them as an array.

```js
const result = await db
  .insert('name email')
  .into('users')
  .run(['Brian Badger', 'brian@badgerpower.com'])
// -> INSERT INTO "users" ("name", "email")
//    VALUES (?, ?)
```

Although this method doesn't return any rows from the database is does
return a result.

You can pass a second argument to the `run()` method as an object containing
options.  The `sanitizeResult` option standardised the response for different
database types so that, for example, `changes` always contains the number of
rows changed.

```js
const result = await db
  .insert('name email')
  .into('users')
  .run(
    ['Brian Badger', 'brian@badgerpower.com'],
    { sanitizeResult: true }
  )
console.log("changes: ", result.changes)
```

If you specify any placeholder values in the query then these will automatically
be provided to the `run()` method.  For example, the
[`values()`](#values-values) method can be used to provide values to an
[`insert()`](insert-query) query.

```js
const result = await db
  .insert('name email')
  .into('users')
  .values('Brian Badger', 'brian@badgerpower.com')
  .run()
```

### one(values, options)

This method will execute the query and return exactly one row.  If the query
returns more than one row or no rows then an error will be thrown.

If you have any placeholders in the query that you haven't already defined
values for then you should provide them as an array.

In this query the value for `id` is specified in the [`where()`](select-query#where-criteria)
method so you don't need to pass anything to the `one()` method.

```js
const row = await db
  .select('name email')
  .from('users')
  .where({ id: 12345 })
  .one()            // automatically receives placeholder values: [12345]
// -> SELECT "name", "email"
//    FROM "users"
//    WHERE "id" = ?
```

In this query it isn't so you need to provide it to the `one()` method.

```js
const row = await db
  .select('name email')
  .from('users')
  .where('id')
  .one([12345])     // manually provider placeholder values
// -> SELECT "name", "email"
//    FROM "users"
//    WHERE "id" = ?
```

Although it generally isn't recommended you can mix and match the two approaches.
However you should note that all placeholder values that have been specified
in [`where()`](select-query#where-criteria) clauses will be provided first, followed by
any in [`having()`](select-query#having-criteria) clauses. Any additional values that you
provide to the `one()` method will come last.  It is your responsibility to
ensure that these are in the correct order for your query!

If you have a mixture of [`where()`](select-query#where-criteria) and
[`having()`](select-query#having-criteria) calls, then you might find yourself
in a tight spot if you've mixed and matched.

Consider this somewhat contrived example:

```js
db.select(...)
  .from(...)
  .where({ a: 10 })
  .where('b')
  .having({ c: 30 })
  .having('d');
// -> SELECT ...
//    FROM ...
//    WHERE "a" = ?
//    AND "b" = ?
//    HAVING "c" = ?
//    AND "d" = ?
```

Now you've got a problem.  When you call the `one()` (or `any()`/`all()`) method
you need to provide values for `b` and `d`.  But the query has already got a list
of values for `where()` clauses set to `[10]` (for `a`) and a list for `having()`
clauses set to `[30]` (for `c`).  If you pass the values for `b` and `c` as `[20, 40]`
then you'll end up with a complete list of values set to `[10, 30, 20, 40]` which isn't
in the correct order for the query.

At this point we could refer you back to the bit where we said that mixing up different
approaches isn't recommended.  But you already know that.

If you need to jiggle around with the order of values then you can pass a function
to the `one()` method.  This will received three lists of placeholder values:

* `setValues` contains any placeholder values provided via the
[`values()`](#values-values) method as part of an [`insert()`](#insert-columns)
query, or via the [`set()`](#set-values) method as part of an [`update()`](#update-table)
query.

* `whereValues` contains any placeholder values provided via the
[`where()`](#where-criteria) method.

* `havingValues` contains any placeholder values provided via the
[`having()`](#having-criteria) method.

The function should return a new array containing the values in the right order.

```js
db.select(...)
  .from(...)
  .where({ a: 10 })
  .where('b')
  .having({ c: 30 })
  .having('d')
  .one((where, having) => [...where, 20, ...having, 40])
```

Now the order of placeholder values will be correctly set to `[10, 20, 30, 40]`.

If you want to double-check you can call the [`allValues()`](#allvalues) method
on a query to check that it returns them in the right order.

```js
db.select(...)
  .from(...)
  .where({ a: 10 })
  .where('b')
  .having({ c: 30 })
  .having('d')
  .values((where, having) => [...where, 20, ...having, 40])
  .allValues()
// -> [10, 20, 30, 40]
```

You can also call the [`whereValues()`](#wherevalues) and
[`havingValues()`](#havingvalues) methods to see what the query
has got stored for them.

### any(values, options)

This method will execute the query and return one row if it exists or `undefined`
if it doesn't.  In all other respects it works exactly like [`one()`](#one-values-options).

### all(values, options)

This method will execute the query and return an array of all matching rows.
The array may be empty if no rows are matched.  In all other respects it works
exactly like [`one()`](#one-values-options).

### sql()

This methods generates and returns the SQL for the query.

## Placeholder Value Methods

### setValues()

This returns any array of any placeholder values provided to the
[`values()`](#values-values) or
[`set()`](#set-values) methods.

### whereValues()

This returns any array of any placeholder values provided to the
[`where()`](#where-criteria) method.

### havingValues()

This returns any array of any placeholder values provided to the
[`having()`](#having-criteria) method.

### allValues()

This returns an array of all placeholder values.  It is the concatenated
list of [`setValues()`](#setvalues), [`whereValues()`](#wherevalues)
and [`havingValues()`](#havingvalues)

## Where Next?

In the next section we'll look at [tables](tables) which provide
methods to automatically generate queries to insert, update, fetch and delete
rows.
