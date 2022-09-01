# Schema

The `Schema` object is used internally to manage the schema
for a table.  You probably don't need to know about this unless
you're looking under the hood.


* [Configuration](#configuration)
  * [table](#table)
  * [columns](#columns)
  * [virtualColumns](#virtualcolumns)
  * [columnSets](#columnsets)
  * [id](#id)
  * [keys](#keys)
  * [relations](#relations)
  * [queries](#queries)
  * [fragments](#fragments)
  * [tableClass](#tableclass)
  * [recordClass](#recordclass)
* [Properties](#properties)
  * [database](#database)
  * [table](#table)
  * [id](#id)
  * [keys](#keys)
  * [keyIndex](#keyindex)
  * [columnIndex](#columnindex)
  * [columnNames](#columnnames)
  * [virtualColumns](#virtualcolumns)
  * [allColumns](#allcolumns)
  * [columnSets](#columnSets)
  * [relations](#relations)
  * [fragments](#fragments)
* [Methods](#methods)
  * [prepareColumns(schema)](#preparecolumns-schema-)
  * [prepareColumnSets(schema)](#preparecolumnsets-schema-)
  * [prepareKeys(schema)](#preparekeys-schema-)
  * [prepareFragments(schema)](#preparefragments-schema-)
  * [column(name)](#column-name-)
  * [columnSet(name)](#columnset-name-)
  * [defaultColumns()](#defaultcolumns--)
  * [columns(names)](#columns-names-)
  * [resolveColumns(names)](#resolvecolumns-names-)
  * [identity(data)](#identity-data-)
* [Functions](#functions)
  * [schema(database,tableSchema)](#schema-database-tableschema-)

## Configuration

A schema is created with two arguments.  The first is a `Database`
object reference, the second is a data object defining the schema
for the table.

```js
const scheme = new Scheme(
  database,
  {
    table: 'users',
    columns: 'id name email'
  }
)
```

The configuration options are the same as for the [Table](manual/table.html).

### table

The database table name.

### columns

The columns in the table that you want to be able to access.

### virtualColumns

Columns that are computed from other columns.

### columnSets

Named sets of columns.

### id

The column that uniquely identifies each row.

### keys

The columns that uniquely identifies each row, used where a table
has a compound key.

### relations

Used to define relations that a table has to other tables.

### queries

Used to define named SQL queries that are local to the table.

### fragments

Used to define named SQL query fragments that can be interpolated
into [queries](#queries).

### tableClass

A custom class to use for the table instance.

### recordClass

A custom class to use for the record instances.

## Properties

### database

A reference to the [Database](manual/database.html) object.

### table

The name of the underlying database table.

### id

The column that uniquely identifies each row.

### keys

The columns that uniquely identifies each row, used where a table
has a compound key.

### keyIndex

A lookup table for [keys](#keys) mapping the column name to a
`true` value.  Used to quickly determine if a column is a key.

### columnIndex

A lookup table mapping column names to their specification.

### columnNames

An array of all column names.

### virtualColumns

A lookup table mapping virtual column names to their definitions.

### allColumns

A lookup table mapping the names of all columns (real columns and virtual
columns) to their definitions.

### columnSets

A lookup table mapping the names of all column sets to their definitions.

### relations

A lookup table mapping relation names to their definitions.

### fragments

A lookup table mapping SQL query fragments to their definitions.

## Methods

### prepareColumns(schema)

Creates the [columnIndex](#columnindex) and [columnNames](#columnnames)
properties.

### prepareColumnSets(schema)

Prepares the column sets and creates the [columnSets](#columnsets) property.

###  prepareKeys(schema)

Prepares any id or keys definitions and sets the [id](#id),
[keys](#keys) and [keyIndex](#keyindex) properties.

###  prepareFragments(schema)

Merges any user-supplied [fragments](#fragments) with additional
fragments specific to the table.  These will all be pre-escaped
according to the database client in use.  For example, when using
sqlite3, a table column of `albums.id` will be escaped as `"albums"."id"`
whereas for MySQL it will be escaped with backticks instead of double
quote characters.

* `table` - the table name, e.g. `"albums"`
* `columns` - a comma separated list of all table column names,
e.g. `"id", "title", "year"`
* `tcolumns` - a comma separated list of all column names prefixed with
the table name, e.g. `"albums"."id", "albums"."title", "albums"."year"`

In additional any [virtualColumns](#virtualcolumns) are included in the
fragments.  For example, consider a [virtualColumn](#virtualcolumns) defined
like this:

```js
virtualColumns: {
  titleYear:    'title || " (" || year || ")"',
}
```

It can be embedded in SQL queries as `<titleYear>` and will expand
to `title || " (" || year || ")" as titleYear`.

Note that you are responsible for escaping any table names or columns that
might be reserved words in your [virtualColumns](#virtualcolumns) and
[fragments](#fragments).

### column(name)

Returns a real column, a virtual column or throws an error.

### columnSet(name)

Returns a column set.

### defaultColumns()

Return the default column set, from `this.columnSets.default` or
`this.columns`.

### columns(names)

Expands a set of column names.

### resolveColumns(names)

Resolves a set of columns and/or column sets.

### identity(data)

Returns an object containing the `id` or `keys` from the data
passes.

## Functions

### schema(database,tableSchema)

A function of convenience which wraps a call to `new Schema()`.

```js
import { schema } from '@abw/badger-database';
const sch = schema(...);
```

This is equivalent to:

```js
import { Schema } from '@abw/badger-database';
const sch = new Schema(...);
```
