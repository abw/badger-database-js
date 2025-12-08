---
outline: deep
---

# Delete Query Methods

## delete()

The `delete()` method is used to start a `DELETE` query.  In the usual
case it doesn't take any arguments, but should be used in conjunction with
[`from()`](select-query#from-table) to specify the table, and optionally
[`where()`](select-query#where-criteria), to select the rows that you want to delete.

```js
await db
  .delete()
  .from('users')
  .where({ id: 12345 })
  .run()
// -> DELETE FROM "users"
//    WHERE "id" = ?
```

As usual, values can be specified in the [`where()`](select-query#where-criteria)
method, as shown above, or passed to the [`run()`](query-execute#run-values-options) method.

```js
await db
  .delete()
  .from('users')
  .where('id')
  .run([12345])
```
