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

