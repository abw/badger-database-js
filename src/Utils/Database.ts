import { extract, hasValue, isString } from '@abw/badger-utils'
import { invalid, missing } from './Error'
import { ConnectConfig, DatabaseConnection, DatabaseConnectionConfig } from '../types'
import {
  DATABASE_CONNECTION_ALIASES, MATCH_DATABASE_ELEMENTS, MATCH_DATABASE_URL,
  VALID_CONNECTION_KEYS
} from '../Constants'

/**
 * Function to create and sanitize a database configuration.
 * @example
 * const config = databaseConfig({
 *   database: 'sqlite://dbfile.db'
 * })
 * @example
 * const config = databaseConfig({
 *   database: 'mysql://user:password@hostname:port/database'
 * })
 * @example
 * const config = databaseConfig({
 *   database: 'postgres://user:password@hostname:port/database'
 * })
 * @example
 * const config = databaseConfig({
 *   database: {
 *     engine:   'sqlite',
 *     filename: 'dbfile.db'
 *   }
 * })
 * @example
 * const config = databaseConfig({
 *   database: {
 *     engine:   'postgres',
 *     database: 'musicdb',
 *     user:     'bobby',
 *     password: 'secret',
 *     host:     'mydbhost.com',
 *     port:     '5150',
 *     options:  {
 *       lock_timeout: 2000,
 *     }
 *   }
 * })
 * @example
 * const config = databaseConfig({
 *   database: 'postgres://user:password@hostname:port/database',
 *   engineOptions: {
 *     lock_timeout: 2000,
 *   },
 *   pool: {
 *     min: 10,
 *     max: 20
 *   }
 * })
 */
export const databaseConfig = (
  config: ConnectConfig
) => {
  const database = config.database ||
    ( config.env
        ? configEnv(config.env, { prefix: config.envPrefix })
        : missing('database')
    )

  const connection: DatabaseConnection = isString(database)
    ? parseDatabaseString(database)
    : extractDatabaseConfig(database)

  // merge in any engineOptions and pool specified in the top-level config
  if (config.engineOptions) {
    connection.options = config.engineOptions
  }
  if (config.pool) {
    connection.pool = config.pool
  }

  return connection
}

/**
 * Function to extract any valid database connection options from `config`,
 * including any specified using aliases.
 */
export const extractDatabaseConfig = (
  config: DatabaseConnectionConfig
): DatabaseConnection => {
  // first look for any valid connection options
  const connection = Object.keys(VALID_CONNECTION_KEYS).reduce(
    (connection, key) => {
      if (hasValue(config[key])) {
        connection[key] = config[key]
      }
      return connection
    },
    { } as DatabaseConnection
  )

  // then any valid aliases
  Object.entries(DATABASE_CONNECTION_ALIASES).reduce(
    (connection, [alias, key]) => {
      if (hasValue(config[alias])) {
        connection[key] = config[alias]
      }
      return connection
    },
    connection
  )

  return connection
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
  return hasValue(env[prefix])
    ? parseDatabaseString(env[prefix])
    // TODO: we should make this more robust and assert that the required
    // options (e.g. engine, name, etc) are specified
    : extract(
      env, regex,
      { key: key => key.replace(regex, '').toLowerCase() }
    )
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
