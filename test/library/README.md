This directory contains libraries that are used by other
test scripts.  It doesn't contain any tests itself that
are run by `pnpm test` and is excluded thanks to the
`"!test/library/"` entry in the `"files"` section of
`ava.config.js` in the project root directory.

* [database.js](database.js) - creates a sqlite3 in-memory database connection
* [music.js](music.js) - creates and populates a music database
* [users.js](users.js) - creates and populates a database of users
* [mysql.js](mysql.js) - tests for a locally defined MySQL database