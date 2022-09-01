# Tables

The `Tables` object is used to provide configuration details
for tables.

You probably don't need to know about this unless you're looking
under the hood.

* [Configuration](#configuration)
  * [tables](#tables)
* [Methods](#methods)
  * [table(name)](#table-name-)

## Overview

The default implementation provide by the `Tables` module is
trivially simple.

The [Database](manual/database.html) object creates a `Tables`
object passing it the [tables](manual/database.html#tables) configuration option.
It implements the [table(name)](#table-name-) method which returns the corresponding
table configuration.

It exists only as a hook to allow you to provide your own implementation for
fetching table configuration options.

For example, instead of defining all your tables up front when you create
the [Database](manual/database.html) object, you might prefer to define
each table configuration in a separate YAML or JSON file and load them
on demand the first time the table is used.

You can write your own subclass of the `Tables` modules which only needs
to implement the [table(name)](#table-name-) method.  It can then load
the relevant file and return the details.

```js
import { Tables } from '@abw/badger-database';

export class MyTables extends Tables {
  table(name) {
    const config = // your code goes here;

    if (config) {
        return config;  // success
    }
    else {
        return false;   // not found
    }
  }
}

export default MyTables
```

Provide the name of your subclass to the database using the
[tablesClass](manual/database.html#tablesclass) configuration option.  The
database constructor will instantiate an instance of your class, passing
it any [tables](manual/database.html#tables) configuration option that it
has been passed.

```js
import Database from '@abw/badger-database';
import MyTables from './path/to/MyTables.js';

const database = new Database(
  // ...client, connection, pool, etc...
  tablesClass: MyTables
)
```

Alternately you can pre-instantiate an instance of your class and pass it
as the [tablesObject](manual/database.html#tablesobject) configuration option.

```js
import Database from '@abw/badger-database';
import MyTables from './path/to/MyTables.js';

const myTables = new MyTables();
const database = new Database(
  // ...client, connection, pool, etc...
  tablesObject: myTables
)
```

## Configuration

### tables

A hash object mapping table names to the configuration options for
the table.

## Methods

### table(name)

Returns the configuration for the named table.  If you subclass the module
then you should re-define this method to implement any custom functionality.

If an invalid table name is provided then it should return a false value.
The method is called by the database [hasTable()](manual/database.html#hastable--)
method.  This in turn is called by the database [table(name)](manual/database.html#hastable--) which will take responsibility for throwing an error if the
table doesn't exist.

Any other errors that occur (e.g. invalid markup while reading a data file) should
be thrown as errors.

