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
  const db = await connect({
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
const db = await connect({
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

In theory it's possible to write your own modules which can be linked into the
query builder chain.  In practice there are limitations about the extent to which
they can affect the SQL query generated.  This may improve in the future if there
is any demand for it.

If you do want to experiment then you should create a subclass of the `Builder`
module.  There currently isn't any documentation on how to write a builder module,
but you can browse the source code of the existing
[builder modules](https://github.com/abw/badger-database-js/tree/master/src/Engine) for
inspiration.  You should also familiarise yourself with how the
[base class Builder](https://github.com/abw/badger-database-js/tree/master/src/Builder.js)
works.

```js
export class MyCoolBuilder extends Builder {
  initBuilder(args) {
    this.key = 'cool';
    console.log("My cool builder:", args);
  }
}
```

You should then register it using the `registerBuilder()` function.

```js
import { registerBuilder } from '@abw/badger-database'

registerBuilder('cool', MyCoolBuilder);
```

It should then be callable as a link in a query builder chain.

```js
db.select('id name').from('users').cool('Hello World!')
```

As mentioned above, you might not be able to generate the SQL that you
want without hacking on the base class `Builder.js` module itself.
If there is any demand for this then I might look into ways in which
this can be improved.

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

export class MyCoolEngine extends Engine {
  configure(config) {
    console.log('got BadgerEngine config:', config);
    return config;
  }
  async connect() {
    // your code to connect to the database
  }
  async disconnect(db) {
    // your code to disconnect from the database
  }
  async run(sql, params=[], options) {
    // your code to run a query
  }
  async any(sql, params=[], options) {
    // your code to run a query and return any row
  }
  async all(sql, params=[], options) {
    // your code to run a query and return all rows
  }
}
```

You should then register it using the `registerBuilder()` function.

```js
import { registerEngine } from '@abw/badger-database'

registerEngine('cool', MyCoolEngine);
```

Then you can connect to it using the `cool` protocol:

```js
import { connect } from '@abw/badger-database'

async function main() {
  const db = connect({ database: 'cool://user:password@host:port/database' });
  // your code here
}

main()
```

If you implement support for a database engine that we don't currently
support then please consider raising a pull request so we can add it
for other people to use.  Or if you prefer you can release it as a
stand-alone module.  End users would still need to call the
`registerEngine()` module to plug it in, but that's only a line or
two of code.
