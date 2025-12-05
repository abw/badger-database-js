import { expect, test } from 'vitest'
import { databaseConfig, parseDatabaseString, configEnv } from '../../src/Utils/Database'


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
    database: 'sqlite:memory'
  })
)

test( 'configEnv() DATABASE_ENGINE, DATABASE_HOST',
  () => expect(
    configEnv({ DATABASE_ENGINE: 'sqlite', DATABASE_FILENAME: ':memory:' })
  ).toStrictEqual({
    database: { engine: 'sqlite', filename: ':memory:' }
  })
)


//-----------------------------------------------------------------------------
// databaseConfig()
//-----------------------------------------------------------------------------

test( 'databaseConfig() database connection string',
  () => {
    const config = databaseConfig({ database: 'engineName://userName:secretPassword@hostName:1234/databaseName' });
    expect(config.engine).toBe('engineName')
    expect(config.database.host).toBe('hostName')
    expect(config.database.port).toBe('1234')
    expect(config.database.database).toBe('databaseName')
    expect(config.database.user).toBe('userName')
    expect(config.database.password).toBe('secretPassword')
  }
);

/*
test( 'databaseConfig() database object with sqlite and and filename',
  () => {
    const config = databaseConfig({ database: { engine: 'sqlite', filename: 'wibble.db' } })
    expect(config.engine).toBe('sqlite')
    expect(config.database.filename).toBe('wibble.db')
  }
);

test( 'databaseConfig() database object with sqlite and file',
  () => {
    const config = databaseConfig({ database: { engine: 'sqlite', file: 'wibble.db' } })
    expect(config.engine).toBe('sqlite')
    expect(config.database.filename).toBe('wibble.db')
  }
);

test( 'databaseConfig() database object renaming user, password, hostname',
  () => {
    const config = databaseConfig({
      database: { engine: 'mysql', username: 'fred', pass: 'secret', hostname: 'wibble.com' }
    });
    expect(config.engine).toBe('mysql')
    expect(config.database.user).toBe('fred')
    expect(config.database.password).toBe('secret')
    expect(config.database.host).toBe('wibble.com')
  }
);

test( 'databaseConfig() - database object with extra option',
  () => {
    const config = databaseConfig({
      database: {
        engine: 'mysql',
        database: 'example',
        extraOption: 'wibble'
      }
    });
    expect(config.engine).toBe('mysql')
    expect(config.database.database).toBe('example')
    expect(config.database.extraOption).toBe('wibble')
  }
);

test( 'databaseConfig() - database object and separate engineOptions',
  () => {
    const config = databaseConfig({
      database: {
        engine: 'mysql',
        database: 'example',
      },
      engineOptions: {
        extraOption: 'wibble'
      }
    });
    expect(config.engine).toBe('mysql')
    expect(config.database.database).toBe('example')
    expect(config.database.extraOption).toBe('wibble')
  }
);

test( 'databaseConfig() database object with pool',
  () => {
    const config = databaseConfig({ database: 'sqlite:memory', pool: { min: 1, max: 1 } });
    expect(config.engine).toBe('sqlite')
    expect(config.database.filename).toBe(':memory:')
    expect(config.pool.min).toBe(1)
    expect(config.pool.max).toBe(1)
  }
);

test( 'databaseConfig() database with invalid engine name',
  () => {
    expect( () => databaseConfig({ database: 'engineName:databaseName' }) )
      .toThrowError('Invalid "database" specified: engineName:databaseName')
  }
);

test( 'databaseConfig() empty object - no database',
  () => {
    expect( () => databaseConfig({ }) )
      .toThrowError('No "database" specified')
  }
);

test( 'configEnv() DATABASE connection string',
  () => {
    expect(configEnv({ DATABASE: 'sqlite:memory' }))
      .toStrictEqual({ database: 'sqlite:memory' })
  }
);

test( 'configEnv() DATABASE_ENGINE, DATABASE_HOST',
  () => {
    expect(configEnv({ DATABASE_ENGINE: 'sqlite', DATABASE_FILENAME: ':memory:' }))
      .toStrictEqual({ database: { engine: 'sqlite', filename: ':memory:' } })
  }
);

test( 'databaseConfig() env with DATABASE connection string',
  () => {
    expect(
      databaseConfig({
        env: { DATABASE: 'sqlite:memory' }
      })
    ).toStrictEqual(
      {
        database: { filename: ':memory:' },
        engine: 'sqlite',
        env: {
          DATABASE: 'sqlite:memory'
        }
      }
    )
  }
);

test( 'databaseConfig() env with DATABASE_ENGINE and DATABASE_FILENAME',
  () => {
    expect(
      databaseConfig({
        env: {
          DATABASE_ENGINE: 'sqlite',
          DATABASE_FILENAME: ':memory:'
        }
      })
    ).toStrictEqual({
      database: { filename: ':memory:' },
      engine: 'sqlite',
      env: {
        DATABASE_ENGINE: 'sqlite',
        DATABASE_FILENAME: ':memory:',
      }
    })
  }
);

test( 'databaseConfig() env with extra engineOptions object for options',
  () => {
    expect(
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
      database: { filename: ':memory:', extraOption: 'wibble' },
      engine: 'sqlite',
      env: {
        DATABASE_ENGINE: 'sqlite',
        DATABASE_FILENAME: ':memory:',
      }
    })
  }
)


test( 'databaseConfig() env with envPrefix and connection string',
  () => {
    expect(
      databaseConfig({
        env: { MY_DB: 'sqlite:memory' },
        envPrefix: 'MY_DB',
      })
    ).toStrictEqual({
      database: { filename: ':memory:' },
      engine: 'sqlite',
      env: {
        MY_DB: 'sqlite:memory'
      },
      envPrefix: 'MY_DB'
    })
  }
)

test( 'databaseConfig() env with envPrefix and engine / filename',
  () => {
    expect(
      databaseConfig({
        env: {
          MY_DB_ENGINE: 'sqlite',
          MY_DB_FILENAME: ':memory:'
        },
        envPrefix: 'MY_DB',
      })
    ).toStrictEqual({
      database: { filename: ':memory:' },
      engine: 'sqlite',
      env: {
        MY_DB_ENGINE: 'sqlite',
        MY_DB_FILENAME: ':memory:',
      },
      envPrefix: 'MY_DB',
    })
  }
)
*/