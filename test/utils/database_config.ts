import { expect, test } from 'vitest'
import { databaseConfig, parseDatabaseString, configEnv, extractDatabaseConfig } from '../../src/Utils/Database'


//-----------------------------------------------------------------------------
// parseDatabaseString()
//-----------------------------------------------------------------------------
test( 'postgresql connection string',
  () => expect(
    parseDatabaseString('postgresql://tommy:secret@myhost:3211/my_database')
  ).toStrictEqual({
    engine: 'postgres',
    database: 'my_database',
    host: 'myhost',
    port: '3211',
    user: 'tommy',
    password: 'secret',
    connectionString: 'postgresql://tommy:secret@myhost:3211/my_database'
  })
)

test( 'postgres connection string',
  () => expect(
    parseDatabaseString('postgres://tammy:hidden@herhost:3212/her_database')
  ).toStrictEqual({
    engine: 'postgres',
    database: 'her_database',
    host: 'herhost',
    port: '3212',
    user: 'tammy',
    password: 'hidden',
    // NOTE: we accept 'postgres' as the short form of 'postgresql' but it
    // should be modified to have the longer form
    connectionString: 'postgresql://tammy:hidden@herhost:3212/her_database'
  })
)

test( 'sqlite connection string with filename',
  () => expect(
    parseDatabaseString('sqlite://filename.db')
  ).toStrictEqual({
    engine: 'sqlite',
    filename: 'filename.db'
  })
)

test( 'sqlite connection string with memory',
  () => expect(
    parseDatabaseString('sqlite://:memory:')
  ).toStrictEqual({
    engine: 'sqlite',
    filename: ':memory:'
  })
)

test( 'shorthand sqlite:memory',
  () => expect(
    parseDatabaseString('sqlite:memory')
  ).toStrictEqual({
    engine: 'sqlite',
    filename: ':memory:',
  })
)

test( 'connection string: engine and database',
  () => expect(
    parseDatabaseString('engineName://databaseName')
  ).toStrictEqual({
    engine: 'engineName',
    database: 'databaseName',
  })
)

test( 'connection string: engine, hostname and database',
  () => expect(
    parseDatabaseString('engineName://hostName/databaseName')
  ).toStrictEqual({
    engine: 'engineName',
    host: 'hostName',
    database: 'databaseName',
  })
)

test( 'connection string: engine, hostname, port and database',
  () => expect(
    parseDatabaseString('engineName://hostName:1234/databaseName')
  ).toStrictEqual({
    engine: 'engineName',
    host: 'hostName',
    port: '1234',
    database: 'databaseName',
  })
)

test( 'connection string: engine, user, hostname and database',
  () => expect(
    parseDatabaseString('engineName://userName@hostName/databaseName')
  ).toStrictEqual({
    engine: 'engineName',
    user: 'userName',
    host: 'hostName',
    database: 'databaseName',
  })
)

test( 'connection string: engine, user, hostname, port and database',
  () => expect(
    parseDatabaseString('engineName://userName@hostName:1234/databaseName')
  ).toStrictEqual({
    engine: 'engineName',
    user: 'userName',
    host: 'hostName',
    port: '1234',
    database: 'databaseName',
  })
)

test( 'connection string: engine, user, password, hostname and database',
  () => expect(
    parseDatabaseString('engineName://userName:secretPassword@hostName/databaseName')
  ).toStrictEqual({
    engine: 'engineName',
    host: 'hostName',
    database: 'databaseName',
    user: 'userName',
    password: 'secretPassword',
  })
)

test( 'connection string: engine, user, password, hostname, port and database',
  () => expect(
    parseDatabaseString('engineName://userName:secretPassword@hostName:1234/databaseName')
  ).toStrictEqual({
    engine: 'engineName',
    host: 'hostName',
    port: '1234',
    user: 'userName',
    password: 'secretPassword',
    database: 'databaseName',
  })
)

test( 'connection string: postgres example',
  () => expect(
    parseDatabaseString('postgres://tommy:top-secret@mydbhost:1234/mydb')
  ).toStrictEqual({
    engine: 'postgres',
    host: 'mydbhost',
    port: '1234',
    user: 'tommy',
    password: 'top-secret',
    database: 'mydb',
    connectionString: 'postgresql://tommy:top-secret@mydbhost:1234/mydb'
  })
)


test( 'invalid connection string: engineName:databaseName',
  () => {
    expect(
      () => parseDatabaseString('engineName:databaseName')
    ).toThrowError(
      'Invalid "database" specified: engineName:databaseName'
    )
  }
)

//--------------------------------------------------------------------------
// configEnv()
//--------------------------------------------------------------------------
test( 'configEnv() DATABASE connection string',
  () => expect(
    configEnv({ DATABASE: 'sqlite:memory' })
  ).toStrictEqual({
    engine: 'sqlite',
    filename: ':memory:'
  })
)

test( 'configEnv() DATABASE_ENGINE, DATABASE_HOST',
  () => expect(
    configEnv({ DATABASE_ENGINE: 'sqlite', DATABASE_FILENAME: ':memory:' })
  ).toStrictEqual({
    engine: 'sqlite',
    filename: ':memory:'
  })
)


//-----------------------------------------------------------------------------
// extractDatabaseConfig()
//-----------------------------------------------------------------------------
test( 'extractDatabaseConfig() with valid keys',
  () => expect(
    extractDatabaseConfig({
      engine: 'postgres',
      user: 'tommy',
      password: 'testing',
      host: 'mydbhost',
      port: 9876,
      database: 'mydb'
    })
  ).toStrictEqual({
      engine: 'postgres',
      user: 'tommy',
      password: 'testing',
      host: 'mydbhost',
      port: 9876,
      database: 'mydb'
  })
)

test( 'extractDatabaseConfig() with valid aliases',
  () => expect(
    extractDatabaseConfig({
      engine: 'postgres',
      username: 'tommy',
      pass: 'testing',
      hostname: 'mydbhost',
      port: 9876,
      name: 'mydb'
    })
  ).toStrictEqual({
      engine: 'postgres',
      user: 'tommy',
      password: 'testing',
      host: 'mydbhost',
      port: 9876,
      database: 'mydb'
  })
)

test( 'extractDatabaseConfig() with sqlite and filename',
  () => expect(
    extractDatabaseConfig({
      engine: 'sqlite',
      filename: 'wibble.db'
    })
  ).toStrictEqual({
      engine: 'sqlite',
      filename: 'wibble.db'
  })
)

test( 'extractDatabaseConfig() with sqlite and file alias',
  () => expect(
    extractDatabaseConfig({
      engine: 'sqlite',
      file: 'wibble.db'
    })
  ).toStrictEqual({
      engine: 'sqlite',
      filename: 'wibble.db'
  })
)

//-----------------------------------------------------------------------------
// databaseConfig()
//-----------------------------------------------------------------------------

test( 'databaseConfig() database connection string',
  () => expect(
    databaseConfig({
      database: 'engineName://userName:secretPassword@hostName:1234/databaseName'
    })
  ).toStrictEqual({
    engine: 'engineName',
    host: 'hostName',
    port: '1234',
    database: 'databaseName',
    user: 'userName',
    password: 'secretPassword',
  })
)

test( 'databaseConfig() database object with sqlite and and filename',
  () => expect(
    databaseConfig({
      database: { engine: 'sqlite', filename: 'wibble.db' }
    })
  ).toStrictEqual({
    engine: 'sqlite',
    filename: 'wibble.db'
  })
)

test( 'databaseConfig() database object with sqlite and file',
  () => expect(
    databaseConfig({
      database: {
        engine: 'sqlite',
        file:   'wibble.db'
      }
    })
  ).toStrictEqual({
    engine:   'sqlite',
    filename: 'wibble.db',
  })
)

test( 'databaseConfig() database object renaming user, password, hostname',
  () => expect(
    databaseConfig({
      database: {
        engine:   'mysql',
        username: 'fred',
        pass:     'secret',
        hostname: 'wibble.com'
      }
    })
  ).toStrictEqual({
    engine:   'mysql',
    user:     'fred',
    password: 'secret',
    host:     'wibble.com',
  })
)

test( 'databaseConfig() - database object with extra options',
  () => expect(
    databaseConfig({
      database: {
        engine: 'mysql',
        database: 'example',
        options: {
          wibble: 'Frusset Pouch'
        }
      }
    })
  ).toStrictEqual({
    engine:   'mysql',
    database: 'example',
    options: {
      wibble: 'Frusset Pouch'
    }
  })
)

test( 'databaseConfig() - database object and separate engineOptions',
  () => expect(
    databaseConfig({
      database: {
        engine: 'mysql',
        database: 'example',
      },
      engineOptions: {
        extraOption: 'wibble'
      }
    })
  ).toStrictEqual({
    engine: 'mysql',
    database: 'example',
    options: {
      extraOption: 'wibble',
    }
  })
)

test( 'databaseConfig() - database string and separate engineOptions',
  () => expect(
    databaseConfig({
      database: 'postgres://tommy:top-secret@mydbhost:1234/mydb',
      engineOptions: {
        lock_timeout: 2000,
      }
    })
  ).toStrictEqual({
    engine: 'postgres',
    connectionString: 'postgresql://tommy:top-secret@mydbhost:1234/mydb',
    database: 'mydb',
    user: 'tommy',
    password: 'top-secret',
    host: 'mydbhost',
    port: '1234',
    options: {
      lock_timeout: 2000,
    }
  })
)

test( 'databaseConfig() database object with pool',
  () => expect(
    databaseConfig({
      database: 'sqlite:memory',
      pool: { min: 1, max: 1 }
    })
  ).toStrictEqual({
    engine: 'sqlite',
    filename: ':memory:',
    pool: { min: 1, max: 1 }
  })
)

test( 'databaseConfig() database with invalid engine name',
  () => expect(
    () => databaseConfig({ database: 'engineName:databaseName' })
  ).toThrowError(
    'Invalid "database" specified: engineName:databaseName'
  )
)

test( 'databaseConfig() empty object - no database',
  () => expect(
    () => databaseConfig({ })
  ).toThrowError(
    'No "database" specified'
  )
)

test( 'databaseConfig() env with DATABASE connection string',
  () => expect(
    databaseConfig({
      env: { DATABASE: 'sqlite:memory' }
    })
  ).toStrictEqual({
    engine: 'sqlite',
    filename: ':memory:'
  })
)

test( 'databaseConfig() env with DATABASE_ENGINE and DATABASE_FILENAME',
  () => expect(
    databaseConfig({
      env: {
        DATABASE_ENGINE: 'sqlite',
        DATABASE_FILENAME: ':memory:'
      }
    })
  ).toStrictEqual({
    engine: 'sqlite',
    filename: ':memory:'
  })
)

test( 'databaseConfig() env with extra engineOptions object for options',
  () => expect(
    databaseConfig({
      env: {
        DATABASE_ENGINE: 'sqlite',
        DATABASE_FILENAME: ':memory:'
      },
      engineOptions: {
        extraOption: 'wibble'
      }
    })
  ).toStrictEqual({
    engine: 'sqlite',
    filename: ':memory:',
    options: {
      extraOption: 'wibble'
    }
  })
)


test( 'databaseConfig() env with envPrefix and connection string',
  () => expect(
    databaseConfig({
      env: { MY_DB: 'sqlite:memory' },
      envPrefix: 'MY_DB',
    })
  ).toStrictEqual({
    engine: 'sqlite',
    filename: ':memory:'
  })
)

test( 'databaseConfig() env with envPrefix and engine / filename',
  () => expect(
    databaseConfig({
      env: {
        MY_DB_ENGINE: 'sqlite',
        MY_DB_FILENAME: ':memory:'
      },
      envPrefix: 'MY_DB',
    })
  ).toStrictEqual({
    engine: 'sqlite',
    filename: ':memory:',
  })
)
