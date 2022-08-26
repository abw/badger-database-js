import { isString, splitList } from '@abw/badger-utils'

export function splitHash(value, hash={ }) {
  const items = splitList(value);
  items.forEach( i => hash[i] = true );
  return hash;
}

export const prepareColumns = (columns, table) => {
  let set = { };
  columns.map(
    column => set[column] = `${table}.${column}`
  );
  return set;
}

export const prepareColumnSets = (columns, columnSets={}) => {
  let sets = { };
  Object.entries(columnSets).map(
    ([key, value]) => sets[key] = prepareColumnSet(columns, value)
  );
  return sets;
}

export const prepareColumnSet = (columns, columnSet) => {
  const basis   = isString(columnSet) ? splitList(columnSet) : columns;
  const include = splitList(columnSet.include);
  const exclude = splitHash(columnSet.exclude);
  return [...basis, ...include]
    .filter( column => ! exclude[column] );
}
