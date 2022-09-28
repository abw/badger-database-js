# Getting Started

- [Installation](#installation)
- [Basic Use](#basic-use)

## Installation

Use your favourite package manager to install the module
from `@abw/badger-database`.  You should also install
at least one of the database driver modules:

* `pg` for Postgres
* `mysql2` for Mysql
* `better-sqlite3` for Sqlite.

### npm

    npm install @abw/badger-database pg

### pnpm

    pnpm add @abw/badger-database pg

### yarn

    yarn add @abw/badger-database pg

## Basic Use

Import the `database` constructor function using ESM syntax.

```js
import database from '@abw/badger-database'
```

The `database` class is the default export.  You can also
use named imports.

```js
import { database } from '@abw/badger-database'
```

Or you can use `require()` if you're still using Common JS format.

```js
const { database } = require('@abw/badger-database')
```
