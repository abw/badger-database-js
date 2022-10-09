# Testing

If you want to run the developer tests then you must first install the
developer dependencies, including all three database drivers:

```bash
$ npm install
```

You can use `yarn` or `pnpm` instead of `npm` if you prefer.

You must also have MySQL and Postgres installed and running.  Sqlite
will be installed when you install `better-sqlite3`.

You should then create `test` databases in MySQL and Postgres.  These
should be accessible to a user called `test` with the password `test`.

There are scripts in the `bin` directory to do this for you.

```bash
$ bin/create_mysql_test
$ bin/create_postgres_test
```

If for some reason you can't run those scripts, you can manually create
a MySQL database by running these commands in a MySQL shell:

```sql
DROP DATABASE test;
CREATE DATABASE test;
GRANT
  SELECT, INSERT, UPDATE, DELETE, INDEX,
  ALTER, CREATE, DROP, REFERENCES
  ON test.* TO test@test IDENTIFIED BY 'test';
```

The commands for Postgres are slightly different:

```sql
DROP DATABASE test;
CREATE DATABASE test;
DROP USER test;
CREATE USER test PASSWORD 'test';
GRANT ALL PRIVILEGES ON DATABASE test to test;
```

You should then be able to run the test suite.

```bash
$ npm test
```
