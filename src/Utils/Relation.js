import { fail, hasValue, isString, noValue, remove } from "@abw/badger-utils";

const relationStringRegex = /^(\w+)\s*([-~=]>)\s*(\w+)\.(\w+)$/;
const relationType = {
  '~>': 'any',
  '->': 'one',
  '=>': 'many'
};
const relationAliases = {
  localKey:   'from',
  local_key:  'from',
  remoteKey:  'to',
  remote_key: 'to',
  orderBy:    'order',
  order_by:   'order',
};

/**
 * Function to prepare a relation definition.
 * @param {!String} table - the table name
 * @param {!String} name - the relation name
 * @param {!String|Object} config - the relation configuration
 * @return {Object} a relation specification object
 * @example
 * const relation = relationConfig(
 *   'artists', 'albums', 'id => albums.artist_id'
 * })
 * @example
 * const relation = relationConfig(
 *   'artists', 'albums',
 *   {
 *     from:  'id',
 *     type:  'many',
 *     table: 'albums',
 *     to:    'artist_id'
 *    }
 * )
 */
export const relationConfig = (table, name, config) => {
  if (isString(config)) {
    config = parseRelationString(config);
  }
  else if (isString(config.relation)) {
    config = {
      ...parseRelationString(config.relation),
      ...config
    }
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
  if (! config.load) {
    ['type', 'table', 'to', 'from'].forEach(
      key => {
        if (noValue(config[key])) {
          fail(`Missing "${key}" in ${name} relation for ${table} table`);
        }
      }
    );
  }

  // set the name
  config.name = `${table}.${name}`;

  return config;
}

/**
 * Function to parse a relation definition string
 * @param {!String} string - the relation definition string
 * @return {Object} a relation specification object
 * @example
 * const relation = parseRelationString(
 *   'id => albums.artist_id'
 * })
 */
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

export const whereRelation = (record, spec) => {
  const lkey  = spec.from;
  const rkey  = spec.to;
  let where   = spec.where || { };
  if (lkey && rkey) {
    where[rkey] = record.row[lkey];
  }
  return where
}
