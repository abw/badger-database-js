import { isFunction, isObject, isString, splitList } from '@abw/badger-utils'

export function splitHash(string, value=true, hash={ }) {
  // if it's already a hash object then return it unchanged
  if (isObject(string)) {
    return string;
  }
  // split a string into an array (or leave an array unchanged)
  const items = splitList(string);
  // populate the hash with the default value
  items.forEach(
    i => hash[i] = isFunction(value)
      ? value(i)
      : value
  );
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
