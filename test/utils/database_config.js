import test from 'ava';
import { databaseConfig, parseDatabaseString, configEnv } from "../../src/Utils/Database.js";


//-----------------------------------------------------------------------------
// parseDatabaseString()
//-----------------------------------------------------------------------------
test( 'postgresql connection string',
  t => {
    const config = parseDatabaseString('postgresql://user:password@hostname:3211/database');
    t.is( config.engine, 'postgres');
    t.is( config.connectionString, 'postgresql://user:password@hostname:3211/database');
  }
);

test( 'postgres connection string',
  t => {
    const config = parseDatabaseString('postgres://user:password@hostname:3211/database');
    t.is( config.engine, 'postgres');
    t.is( config.connectionString, 'postgresql://user:password@hostname:3211/database');
  }
);

test( 'sqlite connection string with filename',
  t => {
    const config = parseDatabaseString('sqlite://filename.db');
    t.is( config.engine, 'sqlite');
    t.is( config.filename, 'filename.db');
  }
);

test( 'sqlite connection string with memory',
  t => {
    const config = parseDatabaseString('sqlite://:memory:');
    t.is( config.engine, 'sqlite');
    t.is( config.filename, ':memory:');
  }
);

test( 'shorthand sqlite:memory',
  t => {
    const config = parseDatabaseString('sqlite:memory');
    t.is( config.engine, 'sqlite');
    t.is( config.filename, ':memory:');
  }
);

test( 'connection string: engine and database',
  t => {
    const config = parseDatabaseString('engineName://databaseName');
    t.is( config.engine, 'engineName');
    t.is( config.database, 'databaseName');
  }
);

test( 'connection string: engine, hostname and database',
  t => {
    const config = parseDatabaseString('engineName://hostName/databaseName');
    t.is( config.engine, 'engineName');
    t.is( config.host, 'hostName');
    t.is( config.database, 'databaseName');
  }
);

test( 'connection string: engine, hostname, port and database',
  t => {
    const config = parseDatabaseString('engineName://hostName:1234/databaseName');
    t.is( config.engine, 'engineName');
    t.is( config.host, 'hostName');
    t.is( config.port, '1234');
    t.is( config.database, 'databaseName');
  }
);

test( 'connection string: engine, user, hostname and database',
  t => {
    const config = parseDatabaseString('engineName://userName@hostName/databaseName');
    t.is( config.engine, 'engineName');
    t.is( config.user, 'userName');
    t.is( config.host, 'hostName');
    t.is( config.database, 'databaseName');
  }
);

test( 'connection string: engine, user, hostname, port and database',
  t => {
    const config = parseDatabaseString('engineName://userName@hostName:1234/databaseName');
    t.is( config.engine, 'engineName');
    t.is( config.user, 'userName');
    t.is( config.host, 'hostName');
    t.is( config.port, '1234');
    t.is( config.database, 'databaseName');
  }
);

test( 'connection string: engine, user, password, hostname and database',
  t => {
    const config = parseDatabaseString('engineName://userName:secretPassword@hostName/databaseName');
    t.is( config.engine, 'engineName');
    t.is( config.host, 'hostName');
    t.is( config.database, 'databaseName');
    t.is( config.user, 'userName');
    t.is( config.password, 'secretPassword');
  }
);

test( 'connection string: engine, user, password, hostname, port and database',
  t => {
    const config = parseDatabaseString('engineName://userName:secretPassword@hostName:1234/databaseName');
    t.is( config.engine, 'engineName');
    t.is( config.host, 'hostName');
    t.is( config.port, '1234');
    t.is( config.user, 'userName');
    t.is( config.password, 'secretPassword');
    t.is( config.database, 'databaseName');
  }
);

test( 'invalid connection string: engineName:databaseName',
  t => {
    const error = t.throws( () => parseDatabaseString('engineName:databaseName') )
    t.is( error.message, 'Invalid "database" specified: engineName:databaseName');
  }
);

//-----------------------------------------------------------------------------
// databaseConfig()
//-----------------------------------------------------------------------------

test( 'databaseConfig() database connection string',
  t => {
    const config = databaseConfig({ database: 'engineName://userName:secretPassword@hostName:1234/databaseName' });
    t.is( config.engine, 'engineName');
    t.is( config.database.host, 'hostName');
    t.is( config.database.port, '1234');
    t.is( config.database.database, 'databaseName');
    t.is( config.database.user, 'userName');
    t.is( config.database.password, 'secretPassword');
  }
);

test( 'databaseConfig() database object with sqlite and and filename',
  t => {
    const config = databaseConfig({ database: { engine: 'sqlite', filename: 'wibble.db' } });
    t.is( config.engine, 'sqlite');
    t.is( config.database.filename, 'wibble.db');
  }
);

test( 'databaseConfig() database object with sqlite and file',
  t => {
    const config = databaseConfig({ database: { engine: 'sqlite', file: 'wibble.db' } });
    t.is( config.engine, 'sqlite');
    t.is( config.database.filename, 'wibble.db');
  }
);

test( 'databaseConfig() database object renaming user, password, hostname',
  t => {
    const config = databaseConfig({
      database: { engine: 'mysql', username: 'fred', pass: 'secret', hostname: 'wibble.com' }
    });
    t.is( config.engine, 'mysql');
    t.is( config.database.user, 'fred');
    t.is( config.database.password, 'secret');
    t.is( config.database.host, 'wibble.com');
  }
);

test( 'databaseConfig() - database object with extra option',
  t => {
    const config = databaseConfig({
      database: {
        engine: 'mysql',
        database: 'example',
        extraOption: 'wibble'
      }
    });
    t.is( config.engine, 'mysql');
    t.is( config.database.database, 'example');
    t.is( config.database.extraOption, 'wibble');
  }
);

test( 'databaseConfig() - database object and separate engineOptions',
  t => {
    const config = databaseConfig({
      database: {
        engine: 'mysql',
        database: 'example',
      },
      engineOptions: {
        extraOption: 'wibble'
      }
    });
    t.is( config.engine, 'mysql');
    t.is( config.database.database, 'example');
    t.is( config.database.extraOption, 'wibble');
  }
);

test( 'databaseConfig() database object with pool',
  t => {
    const config = databaseConfig({ database: 'sqlite:memory', pool: { min: 1, max: 1 } });
    t.is( config.engine, 'sqlite');
    t.is( config.database.filename, ':memory:');
    t.is( config.pool.min, 1 );
    t.is( config.pool.max, 1 );
  }
);

test( 'databaseConfig() database with invalid engine name',
  t => {
    const error = t.throws( () => databaseConfig({ database: 'engineName:databaseName' }) )
    t.is( error.message, 'Invalid "database" specified: engineName:databaseName');
  }
);

test( 'databaseConfig() empty object - no database',
  t => {
    const error = t.throws( () => databaseConfig({ }) )
    t.is( error.message, 'No "database" specified');
  }
);

test( 'configEnv() DATABASE connection string',
  t => {
    const config = configEnv({ DATABASE: 'sqlite:memory' });
    t.deepEqual(config, { database: 'sqlite:memory' });
  }
);

test( 'configEnv() DATABASE_ENGINE, DATABASE_HOST',
  t => {
    const config = configEnv({ DATABASE_ENGINE: 'sqlite', DATABASE_FILENAME: ':memory:' });
    t.deepEqual(config, { database: { engine: 'sqlite', filename: ':memory:' } });
  }
);

test( 'databaseConfig() env with DATABASE connection string',
  t => {
    const config = databaseConfig({
      env: { DATABASE: 'sqlite:memory' }
    });
    t.deepEqual(
      config,
      {
        database: { filename: ':memory:' },
        engine: 'sqlite',
        env: {
          DATABASE: 'sqlite:memory'
        }
      }
    );
  }
);

test( 'databaseConfig() env with DATABASE_ENGINE and DATABASE_FILENAME',
  t => {
    const config = databaseConfig({
      env: {
        DATABASE_ENGINE: 'sqlite',
        DATABASE_FILENAME: ':memory:'
      }
    });
    t.deepEqual(
      config,
      {
        database: { filename: ':memory:' },
        engine: 'sqlite',
        env: {
          DATABASE_ENGINE: 'sqlite',
          DATABASE_FILENAME: ':memory:',
        }
      }
    );
  }
);

test( 'databaseConfig() env with extra engineOptions object for options',
  t => {
    const config = databaseConfig({
      env: {
        DATABASE_ENGINE: 'sqlite',
        DATABASE_FILENAME: ':memory:'
      },
      engineOptions: {
        extraOption: 'wibble'
      }
    });
    t.deepEqual(
      config,
      {
        database: { filename: ':memory:', extraOption: 'wibble' },
        engine: 'sqlite',
        env: {
          DATABASE_ENGINE: 'sqlite',
          DATABASE_FILENAME: ':memory:',
        }
      }
    );
  }
);

test( 'databaseConfig() env with envPrefix and connection string',
  t => {
    const config = databaseConfig({
      env: { MY_DB: 'sqlite:memory' },
      envPrefix: 'MY_DB',
    });
    t.deepEqual(
      config,
      {
        database: { filename: ':memory:' },
        engine: 'sqlite',
        env: {
          MY_DB: 'sqlite:memory'
        },
        envPrefix: 'MY_DB'
      }
    );
  }
);

test( 'databaseConfig() env with envPrefix and engine / filename',
  t => {
    const config = databaseConfig({
      env: {
        MY_DB_ENGINE: 'sqlite',
        MY_DB_FILENAME: ':memory:'
      },
      envPrefix: 'MY_DB',
    });
    t.deepEqual(
      config,
      {
        database: { filename: ':memory:' },
        engine: 'sqlite',
        env: {
          MY_DB_ENGINE: 'sqlite',
          MY_DB_FILENAME: ':memory:',
        },
        envPrefix: 'MY_DB',
      }
    );
  }
);