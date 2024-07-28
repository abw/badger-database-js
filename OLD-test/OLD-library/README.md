This directory contains libraries that are used by other
test scripts.  It doesn't contain any tests itself that
are run by `pnpm test` and is excluded thanks to the
`"!test/library/"` entry in the `"files"` section of
`ava.config.js` in the project root directory.
