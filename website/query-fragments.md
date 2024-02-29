# Query Fragments

You might want to define a number of similar queries for fetching user
rows using different search terms.  For example, to select a user by
`email` or `name`.

```js
const dbConfig = {
  database: 'sqlite://test.db',
  queries: {
    selectUserByEmail:
      'SELECT * FROM users WHERE email=?',
    selectUserByName:
      'SELECT * FROM users WHERE name=?'
  }
};
```

## fragments

To avoid repetition, you can define named SQL `fragments` that can be embedded
into other `queries`.  Named fragments can be embedded into queries inside angle
brackets, e.g. `<fragmentName>`.

```js
const dbConfig = {
  database: 'sqlite://test.db',
  fragments: {
    selectUser:
      'SELECT * FROM users'
  },
  queries: {
    selectUserByEmail:
      '<selectUser> WHERE email=?',
    selectUserByName:
      '<selectUser> WHERE name=?'
  }
};
```

Fragments can reference other fragments.  This can be useful when you're building
more complex queries, as shown in this somewhat contrived example:

```js
const dbConfig = {
  database: 'sqlite://test.db',
  fragments: {
    selectUserCompany:
      'SELECT users.*, companies.* FROM users',
    joinUserCompany:
      'JOIN companies on users.company_id=companies.id',
    selectEmployee:
      '<selectUserCompany> <joinUserCompany>',
  },
  queries: {
    selectEmployeeByEmail:
      '<selectEmployee> WHERE email=?',
    selectEmployeeByName:
      '<selectEmployee> WHERE name=?'
  }
};
```

You can also embed fragments into ad-hoc queries passed to the
[`run()`](basic-queries#run), [`one()`](basic-queries#one),
[`any()`](basic-queries#any) and [`all()`](basic-queries#all) methods.
For example, given the above configuration you could write a custom query
that includes the `selectEmployee` fragment like so:

```js
const badgers = await db.all(
  '<selectEmployee> WHERE companies.name=?',
  ['Badgers Inc.']
);
```

## sql()

If you want to see how a query is expanded you can call the `sql()`
method.  This will return the expanded SQL query.

```js
db.sql('<selectEmployee> WHERE companies.name=?');
// -> SELECT users.*, companies.* FROM users
//    JOIN companies on users.company_id=companies.id
//    WHERE companies.name=?
```

## Where Next?

You can also generate SQL queries using the
[query builder](query-builder).