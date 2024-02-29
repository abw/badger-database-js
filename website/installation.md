# Installation

Use your favourite package manager to install the module
from `@abw/badger-database`.  You should also install
at least one of the database driver modules:

* `pg` for Postgres
* `mysql2` for Mysql or MariaDB
* `better-sqlite3` for Sqlite.

::: code-group
```shell [npm]
// postgres
npm install @abw/badger-database pg
// mysql
npm install @abw/badger-database mysql2
// sqlite
npm install @abw/badger-database better-sqlite3
```

```shell [pnpm]
// postgres
pnpm add @abw/badger-database pg
// mysql
pnpm add @abw/badger-database mysql2
// sqlite
pnpm add @abw/badger-database better-sqlite3
```

```shell [yarn]
// postgres
yarn add @abw/badger-database pg
// mysql
yarn add @abw/badger-database mysql
// sqlite
yarn add @abw/badger-database better-sqlite3
```

:::

## Where Next?

Once you've got it installed you're ready to [connect](connecting.html)
to a database.