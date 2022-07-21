import { splitList } from '@abw/badger'

export function splitHash(value) {
  const items = splitList(value);
  let hash = { };
  items.forEach( i => hash[i] = true );
  return hash;
}

