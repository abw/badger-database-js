# Connection

The `Connection` object is used internally to store the underlying
Knex connection. It is accessible as `database.connection`.

You probably don't need to know about this unless
you're looking under the hood.

* [Configuration](#configuration)
* [Properties](#properties)
  * [config](#config)
  * [knex](#knex)
* [Methods](#methods)
  * [query()](#query--)
  * [raw(sql)](#raw-sql-)
  * [pool()](#pool--)
  * [acquire()](#acquire--)
  * [destroy()](#destroy--)
* [Functions](#functions)
  * [connection()](#connection--)

## Configuration

The configuration options are the same as for
[Knex.js](https://knexjs.org/guide/#configuration-options).

## Properties

### config

A copy of the configuration options.

### knex

A reference to the underlying Knex function/object.

## Methods

### query()

TODO - subject to change

### raw(sql)

A method to execute a raw query on the underlying Knex
object.

```js
connection.raw(query);
```

This is equivalent to:

```js
connection.knex.raw(...arguments);
```

### pool()

Returns the Knex client pool.

Equivalent to:

```js
connection.knex.client.pool;
```

### acquire()

Acquire a connection from the Knex client pool.

Equivalent to:

```js
connection.knex.client.pool.acquire();
```

### destroy()

Calls the [destroy()](https://knexjs.org/guide/#pool) method
on the Knex pool.

## Functions

### connection()

A function of convenience which wraps a call to `new Connection()`.

```js
import { connection } from '@abw/badger-database';
const conn = connection(...);
```

This is equivalent to:

```js
import { Connection } from '@abw/badger-database';
const conn = new Connection(...);
```
