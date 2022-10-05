import { fail, hasValue, isString, noValue, remove } from "@abw/badger-utils";

export const relationStringRegex = /^(\w+)\s*([-=]>)\s*(\w+)\.(\w+)$/;
export const relationType = {
  '->': 'one',
  '=>': 'many'
};
export const relationAliases = {
  localKey:   'from',
  local_key:  'from',
  remoteKey:  'to',
  remote_key: 'to',
  orderBy:    'order',
  order_by:   'order',
};

export const relationConfig = (table, name, config) => {
  if (isString(config)) {
    config = parseRelationString(config);
  }

  // fix up any aliases
  Object.entries(relationAliases).map(
    ([key, value]) => {
      if (hasValue(config[key])) {
        config[value] ||= remove(config, key);
      }
    }
  );

  // check for missing parameters
  ['type', 'table', 'to', 'from'].forEach(
    key => {
      if (noValue(config[key])) {
        fail(`Missing "${key}" in ${name} relation for ${table} table`);
      }
    }
  )

  // set the name
  config.name = `${table}.${name}`;

  return config;
}

export const parseRelationString = string => {
  let match;
  return ((match = string.match(relationStringRegex)))
    ? {
        from:  match[1],
        type:  relationType[match[2]] || fail('Invalid type "', match[2], '" specified in relation: ', string),
        table: match[3],
        to:    match[4],
      }
    : fail("Invalid relation string specified: ", string);
}