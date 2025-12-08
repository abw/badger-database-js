---
outline: deep
---

# Update Query Methods

## update(table)

This method is used to start building an `UPDATE` query.  The argument is the
name of the table you want to update.  It should be used in conjunction
with [`set()`](#set-values).

```js
db.update("users")
// -> UPDATE "users"
```

## set(values)

This method is used to specify the changes that you want to make in an `UPDATE`
query.  You can specify the values as column names and then provide the values
when you call the [`run()`](query-execute#run-values-options) method.

```js
await db
  .update("users")
  .set('name')
  .where('id')
  .run(['Brian the Badger', 12345])
// -> UPDATE "users"
//    SET "name" = ?, "email" = ?
//    WHERE "id" = ?
```

Or you can provide the values to the `set()` method, in the same way that you can
for [`where()`](select-query#where-criteria).

```js
await db
  .update("users")
  .set({ name: 'Brian the Badger' })
  .where({ id: 12345 })
  .run()
```

