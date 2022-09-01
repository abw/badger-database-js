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
* [Methods](#methods)
  * [prepareColumns(schema)](#preparecolumns-schema-)
  * [prepareColumnSets(schema)](#preparecolumnsets-schema-)
  * [prepareKeys(schema)](#preparekeys-schema-)
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

## Methods

### prepareColumns(schema)

Creates the [columnIndex](#columnindex) and [columnNames](#columnnames)
properties.

### prepareColumnSets(schema)

Prepares the column sets and creates the [columnSets](#columnsets) property.

###  prepareKeys(schema)

Prepares any id or keys definitions and sets the [id](#id),
[keys](#keys) and [keyIndex](#keyindex) properties.

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
