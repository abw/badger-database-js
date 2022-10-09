# Query Fragments

You might want to define a number of different queries for fetching user
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

To avoid repetition, you can define named SQL `fragments` that can be embedded
into other queries.  Named fragments can be embedded into queries inside angle
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
      '&lt;selectUser&gt; WHERE email=?',
    selectUserByName:
      '&lt;selectUser&gt; WHERE name=?'
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
      '&lt;selectUserCompany&gt; &lt;joinUserCompany&gt;',
  },
  queries: {
    selectEmployeeByEmail:
      '&lt;selectEmployee&gt; WHERE email=?',
    selectEmployeeByName:
      '&lt;selectEmployee&gt; WHERE name=?'
  }
};
```

You can also embed fragments into ad-hoc queries passed to the
`run()`, `one()`, `any()` and `all()` methods.  For example,
given the above configuration you could write a custom query that
includes the `selectEmployee` fragment like so:

```js
const badgers = await db.all(
  '&lt;selectEmployee&gt; WHERE companies.name=?',
  ['Badgers Inc.']
);
```

