# Schema

The `Schema` object is used internally to manage the schema
for a table.  You probably don't need to know about this unless
you're looking under the hood.

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

## Methods

### prepareColumns(schema)

Creates `this.columnIndex` and `this.columnNames`.

### prepareColumnSets(schema)

Creates `this.columnSets`.

###  prepareKeys(schema)

Sets `this.id`, `this.keys` and `this.keyIndex`.

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
