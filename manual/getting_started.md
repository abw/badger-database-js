# Getting Started

- [Installation](#installation)
- [Basic Use](#basic-use)

## Installation

Use your favourite package manager to install the module
from `@abw/badger-database`.  You should also install
one of the database driver modules, e.g. `pg`, `mysql`,
`sqlite3`, etc.  See the [Knex.js installation guide](https://knexjs.org/guide/#node-js)
for further information

### npm

    npm install @abw/badger-database

### pnpm

    pnpm add @abw/badger-database

### yarn

    yarn add @abw/badger-database

## Basic Use

Import any of the classes or helper functions using ESM syntax.

```js
import { Database } from '@abw/badger-database'
```

Or via `require()` if you're still using Common JS format.

```js
const { Database } = require('@abw/badger-database')
```
