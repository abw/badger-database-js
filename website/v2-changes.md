# Version 2 Breaking Changes

There are a few minor changes between versions 1 and 2.

## connect()

Any engine-specific configuration options can be specified as the
`engineOptions` top-level configuration option.  There is no change here
between versions 1 and 2.

```js
const db = connect({
  database: {
    engine:   'sqlite',
    filename: ':memory:',
  },
  // No change here - this continues to work as before
  engineOptions: {
    verbose: console.log
  }
})
```

Alternately, you can add them as an `options` object in the `database`
top-level configuration object.

```js
const db = connect({
  database: {
    engine:   'sqlite',
    filename: ':memory:',
    // The new way to define additional options
    options: {
      verbose:  console.log
    }
  }
})
```

In version 1 it was possible to include any options directly into the `database`
configuration option.  This is no longer supported.

```js
const db = connect({
  database: {
    engine:   'sqlite',
    filename: ':memory:',
    // DON'T DO THIS ANY MORE!  Move into an `options` sub-object
    verbose:  console.log
  }
})
```
