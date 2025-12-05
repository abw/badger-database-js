import { extract, hasValue, isString, remove } from '@abw/badger-utils'
import { invalid, missing } from './Error'
import { DatabaseConfig, DatabaseConnection, DatabaseConnectionConfig } from '../types'
import { MATCH_DATABASE_ELEMENTS, MATCH_DATABASE_URL } from '../Constants'

/**
 * @ignore
 * Lookup table of aliases for configuration options.
 */
export const databaseAliases = {
  username: 'user',
  pass:     'password',
  hostname: 'host',
  file:     'filename',
  name:     'database',
};

/**
 * Function to create and sanitize a database configuration.  If the argument
 * is a string then it is passed to {@link parseDatabaseString}.
 * @example
 * const config = databaseConfig('sqlite://dbfile.db')
 * @example
 * const config = databaseConfig('mysql://user:password@hostname:port//database')
 * @example
 * const config = databaseConfig('postgres://user:password@hostname:port//database')
 * @example
 * const config = databaseConfig({
 *   engine:   'sqlite',
 *   filename: 'dbfile.db'
 * })
 * @example
 * const config = databaseConfig({
 *   engine:   'postgres',
 *   database: 'musicdb',
 *   user:     'bobby',
 *   password: 'secret',
 *   host:     'mydbhost.com',
 *   port:     '5150'
 * })
 */
export const databaseConfig = (
  config: DatabaseConnectionConfig
) => {
  if (config.env) {
    Object.assign(
      config,
      configEnv(config.env, { prefix: config.envPrefix })
    )
  }
  let database: DatabaseConnection | string = config.database || missing('database');

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

  // merge in any engineOptions
  if (config.engineOptions) {
    Object.assign(database, remove(config, 'engineOptions'));
  }

  return config;
}

/**
 * Function to extract any environment variables that match a particular prefix
 * (default: `DATABASE`), including any optional underscore, e.g. `DATABASE_USER`.
 * @example
 * const config = configEnv(process.env)
 * @example
 * const config = configEnv(process.env, { prefix: 'MY_DB' })
 */

export const configEnv = (
  env: Record<string, string>,
  options: { prefix?: string } = { }
) => {
  const prefix = options.prefix || 'DATABASE'
  const uscore = prefix.match(/_$/) ? '' : '_'
  const regex  = new RegExp(`^${prefix}${uscore}`)

  // if there's an environment variable that exactly matches the prefix,
  // e.g. DATABASE or MY_DATABASE then it's assumed to be a connection
  // string.  Otherwise we extract all the environment variables that
  // start with the prefix (and an underscore if there isn't already one)
  // on the prefix), e.g. DATABASE_ENGINE, DATABASE_HOST, etc., and put
  // them in an object
  const database = env[prefix]
    || extract(
      env, regex,
      { key: key => key.replace(regex, '').toLowerCase() }
    );

  return { database }
}


/**
 * Function to parse a database configuration string and return an object of
 * configuration options.
 * @example
 * const config = parseDatabaseString('postgresql://user:password@host:port/database')
 * @example
 * const config = parseDatabaseString('sqlite://filename.db')
 * @example
 * const config = parseDatabaseString('sqlite://:memory:')
 * @example
 * const config = parseDatabaseString('sqlite:memory')
 */
export const parseDatabaseString = (string: string) => {
  let config = { } as DatabaseConnection
  let match: RegExpMatchArray

  if ((match = string.match(/^sqlite:\/\/(.*)/))) {
    // special case for sqlite which only has a filename (or ":memory:")
    config.engine   = 'sqlite';
    config.filename = match[1];
  }
  else if (string === 'sqlite:memory') {
    // special case for sqlite allowing 'sqlite:memory' as short for 'sqlite://:memory:'
    config.engine   = 'sqlite';
    config.filename = ':memory:';
  }
  else if ((match = string.match(MATCH_DATABASE_URL))) {
    // all other cases (e.g. mysql)
    Object.entries(MATCH_DATABASE_ELEMENTS).map(
      ([key, index]) => {
        const value = match[index];
        if (hasValue(value)) {
          config[key] = value;
        }
      }
    )
    if (config.engine.match(/^postgres(ql)?/)) {
      // special case for postgres which can handle a connectionString
      // NOTE: we accept postgresql: or postgres: as prefixes and Do The
      // Right Thing
      config.engine = 'postgres'
      config.connectionString = string.replace(/^postgres:/, 'postgresql:')
    }
  }
  else {
    invalid('database', string)
  }
  return config
}
