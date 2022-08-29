import { isFunction, isObject, splitList } from '@abw/badger-utils'

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

