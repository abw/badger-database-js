# Debugging

To enable debugging messages for the database library add the `debug` flag to the
`connect()` configuration, set to `true`.

```js
const db = connect({
  database: 'sqlite:memory',
  debug: true
})
```

To enable debugging for individual tables, add the `debug` flag to the table
configuration.

```js
const db = connect({
  database: 'sqlite:memory',
  tables: {
    users: {
      columns: 'id name email',
      debug: true,
    }
  }
})
```

To enable debugging for a record object associated with a table, set the `recordConfig`
for the table to include the `debug` flag.

```js
const db = connect({
  database: 'sqlite:memory',
  tables: {
    users: {
      columns: 'id name email',
      recordConfig: {
        debug: true
      }
    }
  }
})
```

To enable debugging on a global level (for example, to enable it for all tables,
records, etc.), use the `setDebug` function.  You can set any of the following
flags to `true` to enable debugging for that component.

```js
import { connect, setDebug } from '../src/Utils/Debug.js';

setDebug({
  database: true,   // general database queries
  engine:   true,   // lower level functionality
  builder:  true,   // query builder
  tables:   true,   // table provider
  table:    true,   // table methods
  record:   true,   // record methods
})
```

Debugging messages are formatted with a colored prefix to help you identify
where the error came from.

<img src="/images/screenshots/debugging.png" width="100%"/>

You can change the debug message prefix for different components and the color
that it is rendered in.

```js
setDebug({
  engine: {
    debug:  true,
    prefix: 'Snake!',
    color:  'red'
  }
})
```

The available colors are: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`,
`grey` and `white`.  You can also prefix any of them with `bright` or `dark`, e.g.
`dark red`, `bright yellow`, etc.

You can specify the `color` as an object containing `fg` to set the foreground
color and `bg` to set the background color independently.  Note that the `bright` and
`dark` prefixes might not work as you expect, e.g. both foreground and background will
end up bright or dark, even if you only add the modified to one or the other.

```js
setDebug({
  engine: {
    debug:  true,
    prefix: 'Snake!',
    color:  { fg: 'yellow', bg: 'blue' }
  }
})
```

Inside a custom table or record module you can print debugging messages to the console
using the `debug()` method.  If debugging is enabled for the module then it will be
printed to the console.  Otherwise it will be ignored.

```js
export class User extends Record {
  helloWorld() {
    this.debug("helloWorld()");
    // ...your code goes here...
  }
}
```

You can use the `debugData()` method to generate debugging messages to display
the contents of data items.  This is a useful way to inspect the parameters
passed to a method.  Again, it will only generate output if debugging is enabled
for that module so you can safely add these lines to your code and enabled them
by setting the `debug` option when you need to.

```js
export class User extends Record {
  helloWorld(message, options) {
    this.debugData("helloWorld()", { message, options });
    // ...your code goes here...
  }
}
```

