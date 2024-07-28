import { expect, test } from 'vitest'
import { databaseConfig, parseDatabaseString, configEnv } from "../../src/Utils/Database.js";


//-----------------------------------------------------------------------------
// parseDatabaseString()
//-----------------------------------------------------------------------------
test( 'postgresql connection string',
  () => {
    const config = parseDatabaseString('postgresql://user:password@hostname:3211/database')
    expect(config.engine).toBe('postgres')
    expect(config.connectionString).toBe('postgresql://user:password@hostname:3211/database')
  }
);

test( 'postgres connection string',
  () => {
    const config = parseDatabaseString('postgres://user:password@hostname:3211/database')
    expect(config.engine).toBe('postgres')
    expect(config.connectionString).toBe('postgresql://user:password@hostname:3211/database')
  }
);

test( 'sqlite connection string with filename',
  () => {
    const config = parseDatabaseString('sqlite://filename.db')
    expect(config.engine).toBe('sqlite')
    expect(config.filename).toBe('filename.db')
  }
);

test( 'sqlite connection string with memory',
  () => {
    const config = parseDatabaseString('sqlite://:memory:');
    expect(config.engine).toBe('sqlite')
    expect(config.filename).toBe(':memory:')
  }
);

test( 'shorthand sqlite:memory',
  () => {
    const config = parseDatabaseString('sqlite:memory');
    expect(config.engine).toBe('sqlite')
    expect(config.filename).toBe(':memory:')
  }
);

test( 'connection string: engine and database',
  () => {
    const config = parseDatabaseString('engineName://databaseName');
    expect(config.engine).toBe('engineName')
    expect(config.database).toBe('databaseName')
  }
);

test( 'connection string: engine, hostname and database',
  () => {
    const config = parseDatabaseString('engineName://hostName/databaseName');
    expect(config.engine).toBe('engineName')
    expect(config.host).toBe('hostName')
    expect(config.database).toBe('databaseName')
  }
);

test( 'connection string: engine, hostname, port and database',
  () => {
    const config = parseDatabaseString('engineName://hostName:1234/databaseName');
    expect(config.engine).toBe('engineName')
    expect(config.host).toBe('hostName')
    expect(config.port).toBe('1234')
    expect(config.database).toBe('databaseName')
  }
);

test( 'connection string: engine, user, hostname and database',
  () => {
    const config = parseDatabaseString('engineName://userName@hostName/databaseName');
    expect(config.engine).toBe('engineName')
    expect(config.user).toBe('userName')
    expect(config.host).toBe('hostName')
    expect(config.database).toBe('databaseName')
  }
);

test( 'connection string: engine, user, hostname, port and database',
  () => {
    const config = parseDatabaseString('engineName://userName@hostName:1234/databaseName');
    expect(config.engine).toBe('engineName')
    expect(config.user).toBe('userName')
    expect(config.host).toBe('hostName')
    expect(config.port).toBe('1234')
    expect(config.database).toBe('databaseName')
  }
);

test( 'connection string: engine, user, password, hostname and database',
  () => {
    const config = parseDatabaseString('engineName://userName:secretPassword@hostName/databaseName');
    expect(config.engine).toBe('engineName')
    expect(config.host).toBe('hostName')
    expect(config.database).toBe('databaseName')
    expect(config.user).toBe('userName')
    expect(config.password).toBe('secretPassword')
  }
);

test( 'connection string: engine, user, password, hostname, port and database',
  () => {
    const config = parseDatabaseString('engineName://userName:secretPassword@hostName:1234/databaseName');
    expect(config.engine).toBe('engineName')
    expect(config.host).toBe('hostName')
    expect(config.port).toBe('1234')
    expect(config.user).toBe('userName')
    expect(config.password).toBe('secretPassword')
    expect(config.database).toBe('databaseName')
  }
);


test( 'invalid connection string: engineName:databaseName',
  () => {
    expect( () => parseDatabaseString('engineName:databaseName') )
      .toThrowError('Invalid "database" specified: engineName:databaseName')
  }
);

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
