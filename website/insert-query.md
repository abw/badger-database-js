---
outline: deep
---

# Insert Query Methods

## insert(columns)

This method is used to generate an `INSERT` query.  The argument(s) specify
the columns that you want to insert.

```js
db.insert('name email');
```

It should be used in conjunction with [`into()`](#into-table).

## into(table)

This method is used to specify the name of the table that you want to insert into.

```js
db.insert('name email')
  .into('users');
// -> INSERT INTO "users" ("name", "email") VALUES (?, ?)
```

## values(values)

This method can be used to provide values for an insert query.
They can be provided as individual arguments or passed as an
array.

```js
await db
  .insert('name email')
  .into('users')
  .values('Brian Badger', 'brian@badgerpowercom')
  .run();
```

If you don't specify the values here then you should provide them
as an array to the [`run()`](query-execute#run-values-options) method.

```js
await db
  .insert('name email')
  .into('users')
  .run(['Brian Badger', 'brian@badgerpowercom'])
```

## returning(columns)

This methods generate a `RETURNING` clause for Postgres.  The
argument should be one or more columns that the query should
return.

```js
db.insert('name email')
  .into('users')
  .returning('id');
// -> INSERT INTO "users" ("name", "email")
//    VALUES (?, ?)
//    RETURING "id"
```

The method works much like the [`select()`](select-query) method.
For example, you can define an alias by passing a two element array.

```js
db.insert('name email')
  .into('users')
  .returning(['id', 'user_id');
// -> INSERT INTO "users" ("name", "email")
//    VALUES (?, ?)
//    RETURING "id" AS "user_id"
```
