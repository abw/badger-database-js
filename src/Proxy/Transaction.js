/*
  This is a proxy around the database for processing transactions.
  It's an elegant hack, or an ugly hack, depending on how you look at
  it.  But either way, it's a hack.

  All requests in a transaction must be run using the same database
  connection.  This is a problem because we use a connection pool.
  When a query is run the engine takes a connection from the pool,
  runs the query and then releases the connection back to the pool.
  This proxy exists to convince the engine to do something different.

  The database transaction() method creates a Transaction object and
  then calls its run() method.  The run() method acquires a database
  connection from the pool and then calls the user code provided to
  it.  It passes this proxy wrapper around the database along with
  commit and rollback handlers.  When the run() method is complete
  the connection is released back to the pool.

  The other part of the puzzle is making sure that the database engine
  uses the transaction's database connection instead of acquiring a new
  one. All queries are created as Query objects via the database
  buildQuery() method.  The proxy catches calls to that method and adds
  the transaction reference to the configuration options. The Query
  module then forwards the transaction reference to the engine.execute()
  method which will then use the transaction's connection instead of
  acquiring one from the connection pool.

  We also need to catch any calls to the table() method and add in the
  nocache option.  This ensures that a NEW table object is created with
  a database reference that is the proxy wrapper for the database rather
  than the database itself.  This ensures that any database queries that
  are run by the table object inside a transaction are also run the
  same way using the transaction's connection.  Table objects are cached
  so if we didn't do this then there's the chance we'd get a cached table
  which had a reference to the unwrapped database.

  We also need to intercept any access to database.build which contains
  a "root node" for using the query builder.  The select(), insert(),
  update() and delete() methods all use this, and end users can also use
  it to construct new queries.  Instead of returning the cached
  database.build (which contains a reference to the database), we create
  a new builder object which contains a reference to the database proxy
  wrapper.

  (DONE), model and waiter.
  TODO: I've got a nasty suspicion that we could have problems with named
  queries or fragments that are built using the query builder as they
  are all rooted on a Builder/Database node that contains the database
  reference.  Need to check this.
*/

import { databaseBuilder } from "../Builders.js"
// import { yellow } from "../Utils/Color.js";

const handlers = {
  // When the database buildQuery() method is called we add the
  // transaction reference into the configuration options
  buildQuery: (_, method, transaction) => function (source, config={}) {
    // console.log(yellow('adding transaction to buildQuery() config'));
    return method.apply(this, [source, { ...config, transaction }])
  },

  // When the database table() method is called we add the nocache option
  // so that it always returns a new table with the database set to the
  // proxy wrapper around the database
  table: (target, method) => function (name, options={}) {
    // console.log(yellow('adding nocache option to table - '));
    return method.apply(this, [name, { ...options, nocache: true }])
  },

  // The database.build is pre-defined as a wrapper around the database
  // so we need to provide a version that is a wrapper around a proxy
  build: (target, _, transaction) => {
    // console.log(yellow('generating new database.build'));
    return databaseBuilder(
      transactionProxy(target, transaction)
    )
  },

  commit: (target, method, transaction) =>
    () => transaction.commit(),

  rollback: (target, method, transaction) =>
    () => transaction.rollback(),

  isProxy: () => true
}

export const transactionProxy = (database, transaction) =>
  new Proxy(
    database,
    {
      get(target, prop) {
        const value   = Reflect.get(target, prop);
        const handler = handlers[prop];
        if (handler) {
          return handler(target, value, transaction)
        }
        return value;
      }
    }
  )

export default transactionProxy
