# Extending

## Custom Tables Class

You can provide your own implementation of the `Tables` class which
returns the configuration options for a table.  For example, you might
want to define your tables in JSON or YAML files that are loaded on
demand.

The `table(name)` method is called to fetch the configuration options
for a table.  Any pre-defined tables will be stored in `this.tables`.
You can return the data from there or implement some other way to
fetch the configuration options for the table.

```js
import { connect, Tables } from '@abw/badger-database'

class YourTables extends Tables {
  table(name) {
    // any pre-defined tables data will be stored in this.tables
    // or you can fetch it some other way...
    return this.tables[name] ||= this.yourCustomTableLoader(name);
  }
  yourCustomTableLoader(name) {
    // your code here to load the table definition for the `name` table
    // return undefined if the table doesn't exist
    return {
        // columns, etc.
    }
  }
}

async function main() {
  const db = connect({
    // ...database, etc...
    tablesClass: YourTables,
    tables: {
      // these tables will be defined in `this.tables` for YourTables
      users: {
        columns: 'id name email'
      }
    }
  });
  const users = await db.table('users');      // returns users defined above
  const another = await db.table('another');  // calls yourCustomTableLoader('another')
}

main();
```

## Custom Tables Object

You can instantiate your own `Tables` object and define it as the `tablesObject`
configuration item.  If you have any pre-defined `tables` that you want it to
manage then you should pass them as constructor parameters.

```js
const db = connect({
  // ...database, etc...
  tablesObject: new YourTables({
    tables: {
      // these tables will be defined in `this.table` for YourTables
      users: {
        columns: 'id name email'
      }
    },
    // any other configuration options for YourTable
  })
});
```

## Adding Query Builder Methods

You can write your own modules which can be linked into the query builder chain.
See [09_custom_builder](https://github.com/abw/badger-database-js/tree/master/examples/09_custom_builder)
for a working example of this.

You will probably also want to browse the source code of the existing
[builder modules](https://github.com/abw/badger-database-js/tree/master/src/Builder) for
inspiration and enlightenment.  You should also familiarise yourself with how the
[base class Builder](https://github.com/abw/badger-database-js/tree/master/src/Builder.js)
works.

You should create your module as a subclass of the `Builder` module.


```js
export class Hello extends Builder {
  static buildMethod = 'hello'
  static buildOrder  = 0
  static keyword     = '# GREETINGS: '
  static joint       = ', '

  resolveLinkString(arg) {
    return arg;
  }
}
```

It should define the static `buildMethod` property which is the name of the method
that will be callable in a query builder chain.  The `buildOrder` property is a
number from `0` to `100` which determines where in the generated SQL query it will
appear (e.g. `0` is at the start, `10` is where `WITH` is placed, `20` for `SELECT`,
`30` for `FROM`, etc.).  The `keyword` is the SQL keyword that the generated SQL
will start with and `joint` is a string used to combine multiple values.

The `resolveLinkString()` method is called when your method is called with a string
argument.  In this example we simply return the string.  You can also implement
`resolveLinkArray()` and `resolveLinkObject()` methods to handle array and object
arguments, respectively.  Each of these methods should return a SQL query fragment.
Generally speaking these don't include the SQL keyword.  For example, the `from()`
builder component returns a quoted table name or names, but not the `FROM` keyword.

Your module will inherit the static `generateSQL()` which is called to generate a
complete SQL fragment from the parts returned by the above method.  This is
where the SQL `keyword` (e.g. `FROM`) is added and the parts are combined with the
`joint` string (e.g. `["table1", "table2"]` generates `FROM table1, table2`).
You can redefine this method if you want to implement a different behaviour.

You register your module using the `registerBuilder()` function.

```js
import { registerBuilder } from '@abw/badger-database'

registerBuilder(Hello);
```

It should then be callable as a link in a query builder chain.  You can call
it anywhere in the chain.  The `buildOrder` determines where it will appear
in the generated query.

```js
db.select('id name')
  .from('users')
  .hello('Hello World!')
// -> # GREETINGS: Hello World!
//      SELECT "id", "name"
//      FROM "users"
```

You can call the method multiple times, or pass multiple arguments to it.

```js
db.select('id name')
  .hello('Hello World!')
  .from('users')
  .hello('I like badgers!')
// -> # GREETINGS: Hello World!, I like badgers!
//      SELECT "id", "name"
//      FROM "users"
```

## Adding a New Database Engine

If you want to add support for a new database engine then you can.
There currently isn't any documentation about how the engines work but
you can browse the existing
[Engine](https://github.com/abw/badger-database-js/tree/master/src/Engine)
modules to get an idea.  They're all less than 100 lines long so there
isn't much to it.

Your engine module should be a subclass of the `Engine` base class.

```js
import { Engine } from '@abw/badger-database'

export class BadgerEngine extends Engine {
  static name  = 'badger'
  static alias = 'mushroom'

  configure(config) {
    // any custom configuration option handling
    console.log('got BadgerEngine config:', config);
    return config;
  }
  async connect() {
    // your code to connect to the database
  }
  async disconnect(db) {
    // your code to disconnect from the database
  }
  async execute(sql, params=[], options) {
    // acquire a connection from the pool
    const client = await this.acquire();

    try {
      const result = await
        //...database specific code goes here
        .catch( e => this.parseError(sql, e) );

      return options.sanitizeResult
        ? this.sanitizeResult(result, options)
        : result;
    }
    finally {
      // release the connection back to the pool
      this.release(client);
    }
  }
  sanitizeResult(result, options={}) {
    // your code to sanitize the response, e.g. changes, inserted ID
  }
  parseErrorArgs(e) {
    // your code to sanitize a parse error, e.g. message, code, position
  }
}
```

It should define the static `name` property which is used to identify
it.  If you have another name (or names) that you want it to be known
by (e.g. `postgres` is also known as `postgresql`) then you can define
that as the `alias` property.  Multiple aliases can be defined as an
array (e.g. `static alias = ['mushroom', 'snake']`) or using the short
hand syntax of a single whitespace delimited string
(e.g. `static alias = 'mushroom snake'`).

Depending on how the database that you're connecting to works, you may
have to implement other methods as well.

You should then register it using the `registerEngine()` function.

```js
import { registerEngine } from '@abw/badger-database'

registerEngine(BadgerEngine);
```

You can then connect to it using the `badger` protocol (or one of the
alias protocols):

```js
import { connect } from '@abw/badger-database'

const db = connect({
  database: 'badger://username:password@host:port/database'
});
```

The `configure()` method will received the expanded connection parameters.
You can specify them as an object yourself if you prefer:

```js
import { connect } from '@abw/badger-database'

const db = connect({
  database: {
    engine:    'badger',   // or 'mushroom', 'snake'
    user:      'username',
    password:  'password',
    host:      'host',
    port:      'port',
    database:  'database'
});
```

If you implement support for a database engine that we don't currently
support then please consider raising a pull request so we can add it
for other people to use.  Or if you prefer you can release it as a
stand-alone module.  End users would still need to call the
`registerEngine()` module to plug it in, but that's only a line of
code, so not too much trouble.
