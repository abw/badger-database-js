# Engine

The badger-database library uses an *Engine* to talk to the underlying database.
There are three provided: sqlite, mysql and postgres.

This documentation describes the methods provided by the engine classes and
goes into some of the detail about how they are implemented.

If you want to write your own engine class to interface with a database that
isn't supported out of the box then this is for you.  If you're just a casual
user of the library then you can probably skip over this.

## TODO