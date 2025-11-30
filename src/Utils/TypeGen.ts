import { fail, isString } from '@abw/badger-utils'
import { bitSplitter } from '../Constants'
import { TableColumn, TableColumnBits, TableColumns, TableColumnSpec, TableColumnsSpec } from '../types'
import { isValidTableColumnObject } from './Types'

/*
export const prepareColumnBits = (
  name: string,
  bits: TableColumnBits,
  table: string
): TableColumn => {
  return bits.reduce(
    (result, bit) => {
      const kv = bit.split('=', 2);
      const key = kv.shift();
      result[key] = kv.length ? kv[0] : true;
      return result
    },
    { column: name, tableColumn: table + '.' + name }
  );
}

const prepareColumnsHashEntry = (
  name: string,
  value: TableColumnSpec,
  table: string
): TableColumn => {
  if (isString(value)) {
    return prepareColumnBits(
      name,
      value.split(bitSplitter) as TableColumnBits,
      table
    )
  }
  else if (isValidTableColumnObject(value)) {
    // column name can be defined in column spec as 'column' in case
    // the database column name doesn't match the name you want to use
    // const o = value as TableColumnSpec
    const column = value.column || (value.column = name)
    // tableColumn is the full "table.column"
    value.tableColumn = `${table}.${column}`
    return value;
  }
  else {
    fail(`Invalid "${name}" columns specified in ${table} table: ${value}`)
  }
}

const prepareColumnsHash = (
  columns: TableColumnsSpec,
  table: string
): TableColumns => {
  return Object.entries(columns).reduce(
    (columns, [name, value]) => ({
      ...columns,
      [name]: prepareColumnsHashEntry(name, value, table)
    }),
    { } as TableColumns
  )
}


export const prepareColumnsArray = (columns, schema) => {
  let index = { };
  columns.forEach(
    item => {
      const bits  = item.split(bitSplitter);
      const name  = bits.shift();
      index[name] = prepareColumnBits(name, bits, schema);
    }
  )
  return prepareColumnsHash(index, schema);
}


const spec = prepareColumnBits(
  'colname',
  ['readonly', 'id', 'column=foo', 'type=string'],
  'tabname'
)

console.log(`table column spec: `, spec);


*/