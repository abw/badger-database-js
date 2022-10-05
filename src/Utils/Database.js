import { hasValue, isString, remove } from "@abw/badger-utils";
import { databaseAliases, databaseStringElements, databaseStringRegex } from "../Constants.js";
import { invalid, missing } from "./Error.js";


//-----------------------------------------------------------------------------
// Engine configuration
//-----------------------------------------------------------------------------
// databaseConfig(string)
// databaseConfig({ database: { engine: xxx, ... } })
//-----------------------------------------------------------------------------
export const databaseConfig = config => {
  let database = config.database || missing('database');

  if (isString(database)) {
    // parse connection string
    config.database = database = parseDatabaseString(database);
  }

  // extract the engine name to top level config
  config.engine ||= database.engine || missing('database.engine');
  delete database.engine;

  // fixup any aliases
  Object.entries(databaseAliases).map(
    ([key, value]) => {
      if (hasValue(database[key])) {
        database[value] ||= remove(database, key);
      }
    }
  )

  return config;
}


//-----------------------------------------------------------------------------
// Parse Database String
//-----------------------------------------------------------------------------
// parseDatabaseString('postgresql://user:password@host:port/database')
// parseDatabaseString('sqlite://filename.db')
// parseDatabaseString('sqlite://:memory:')
// parseDatabaseString('sqlite:memory')
// parseDatabaseString('driver://user:password@host:port/database')
//                    1^^^^^   2^^^ 3^^^^^^^ 4^^^ 5^^^ 6^^^^^^^
//-----------------------------------------------------------------------------
export const parseDatabaseString = string => {
  let config = { };
  let match;

  if (string.match(/^postgres(ql)?:/)) {
    // special case for postgres which can handle a connectionString
    // NOTE: we accept postgresql: or postgres: as prefixes and Do The
    // Right Thing
    config.engine = 'postgres';
    config.connectionString = string.replace(/^postgres:/, 'postgresql:');
  }
  else if ((match = string.match(/^sqlite:\/\/(.*)/))) {
    // special case for sqlite which only has a filename (or ":memory:")
    config.engine   = 'sqlite';
    config.filename = match[1];
  }
  else if (string === 'sqlite:memory') {
    // special case for sqlite allowing 'sqlite:memory' as short for 'sqlite://:memory:'
    config.engine   = 'sqlite';
    config.filename = ':memory:';
  }
  else if ((match = string.match(databaseStringRegex))) {
    // all other cases (e.g. mysql)
    Object.entries(databaseStringElements).map(
      ([key, index]) => {
        const value = match[index];
        if (hasValue(value)) {
          config[key] = value;
        }
      }
    );
  }
  else {
    invalid('database', string);
  }
  return config;
}
