# Tables

This is a wrapper around a database table.

# Configuration

The configuration for a table should specify the `table` name and a list of
`columns`.


Any computed columns can be specified in `virtualColumns`.  If
you want to be able to specify a group of columns using a single name then
you can defined them in `columnSets`.  If you specify a `default` entry in the
`columnSets` then it will be used as the default column selection in
select and fetch queries.  Otherwise we assume that the full set of `columns`
are the default columns to use.

```js
users = {
  table: 'user',
  columns: [
    'id', 'forename', 'surname', 'email', 'password', 'is_admin',
  ],
  virtualColumns: {
    name: "CONCAT(user.forename, ' ', user.surname)"
  },
  columnSets: {
    // string based subset of columns
    basic: 'forename surname name email',
    // explicitly exclude columns
    default: {
      exclude: 'password is_admin'
    },
    // explicitly include virtual column
    admin: {
      include: 'name is_admin'
    },
    // explicitly include and exclude columns
    public: {
      include: 'name',
      exclude: 'password is_admin'
    },
  }
};
```

# Methods

## query()

Returns a Knex query with the table name pre-defined.

## insert(data)

Insert data into the table.

```js
users.insert({
  forename: 'Bobby',
  surname: 'Badger',
  email: 'bobby@badger.com',
  is_admin: 1,
})
```

You can insert multiple rows in a single call.

```js
users.insert([
  {
    forename: 'Bobby',
    surname: 'Badger',
    email: 'bobby@badger.com',
    is_admin: 1,
  },
  {
    forename: 'Brian',
    surname: 'Badger',
    email: 'brian@badger.com',
    is_admin: 0,
  },
  {
    forename: 'Simon',
    surname: 'Stoat',
    email: 'simon@stoat.com',
  }
]);
```

## selectAll(columns) {

Returns a select query.  The optional `columns` argument can be used to
specify the columns or column sets you want to select.  Otherwise the
default column set will be used.

```js
table.selectAll();
table.selectAll("column1 column2 ...columnset");
table.selectAll().where({ animal: "badger" });
```

## selectOne(columns)

Returns a select query to fetch a single row.  The optional `columns` argument
can be used to specify the columns or column sets you want to select.  Otherwise
the default column set will be used.

```js
table.selectOne();
table.selectOne("column1 column2 ...columnset");
table.selectOne().where({ email: "bobby@badger.com" });
```

## fetchAll(where) {

Returns a select query.  The optional `where` argument can be used to
provide additional constraints.  This is shorthand for chaining a
`where()` method afterwards.

```js
table.fetchAll();
table.fetchAll({ animal: "badger" });
table.fetchAll().where({ animal: "badger" });   // same as above
```

## fetchOne(where) {

Returns a select query that fetches a single record.  The optional `where`
argument can be used to provide additional constraints.  This is shorthand
for chaining a `where()` method afterwards.

```js
table.fetchOne();
table.fetchOne({ animal: "badger" });
table.fetchOne().where({ animal: "badger" });   // same as above
```

## record(query)

Method to create a record object from a single row returned by a query.
This is called automagically by appending a `.record()` method to the
end of a query returned by `selectOne()` or `fetchOne()`.

```js
const badger = await table.fetchOne({ animal: "badger" }).record();
```

## records(query)

Method to create record objects from all rows returned by a query.
This is called automagically by appending a `.records()` method to the
end of a query returned by `selectAll()` or `fetchAll()`.

```js
const badgers = await table.fetchAll({ animal: "badger" }).records();
```
