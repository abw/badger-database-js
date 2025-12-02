import { fail, hasValue, isString, noValue, remove } from "@abw/badger-utils";
import { RelationAliases, RelationArrowMap, RelationConfig, RelationRecord, RelationSpec } from '../types'

const relationStringRegex = /^(\w+)\s*([-~=#]>)\s*(\w+)\.(\w+)$/;

const relationType: RelationArrowMap = {
  '~>': 'any',
  '->': 'one',
  '=>': 'many',
  '#>': 'map',
};

const relationAliases: RelationAliases = {
  localKey:   'from',
  local_key:  'from',
  remoteKey:  'to',
  remote_key: 'to',
  orderBy:    'order',
  order_by:   'order',
};

/**
 * Function to prepare a relation definition.
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
export const relationConfig = (
  table: string,
  name: string,
  config: string | RelationConfig
) => {
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
        // @ts-expect-error: Type 'unknown' is not assignable to type '"any" | "one" | "many" | "map"'.ts(2322)
        config[value] ||= remove(config, key);
      }
    }
  );

  // check for missing parameters, unless there's an explicit load function
  // which will take care of everything
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

  return config as RelationSpec
}

/**
 * Function to parse a relation definition string and return an object
 * containing the extracted details.
 * @example
 * const relation = parseRelationString(
 *   'id => albums.artist_id'
 * })
 */
export const parseRelationString = (string: string) => {
  const match = string.match(relationStringRegex)
  return match
    ? {
        from:  match[1],
        type:  relationType[match[2]] || fail('Invalid type "', match[2], '" specified in relation: ', string),
        table: match[3],
        to:    match[4],
      } as RelationSpec
    : fail("Invalid relation string specified: ", string);
}

export const whereRelation = (
  record: RelationRecord,
  spec: RelationSpec
) => {
  const lkey  = spec.from;
  const rkey  = spec.to;
  let where   = spec.where || { };
  if (lkey && rkey) {
    where[rkey] = record.row[lkey];
  }
  return where
}
