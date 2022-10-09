import test from 'ava';
import { databaseConfig, parseDatabaseString, configEnv } from "../../src/Utils/Database.js";


//-----------------------------------------------------------------------------
// parseDatabaseString()
//-----------------------------------------------------------------------------
test(
  'postgresql://user:password@hostname:3211/database',
  t => {
    const config = parseDatabaseString('postgresql://user:password@hostname:3211/database');
    t.is( config.engine, 'postgres');
    t.is( config.connectionString, 'postgresql://user:password@hostname:3211/database');
  }
);

test(
  'postgres://user:password@hostname:3211/database',
  t => {
    const config = parseDatabaseString('postgres://user:password@hostname:3211/database');
    t.is( config.engine, 'postgres');
    t.is( config.connectionString, 'postgresql://user:password@hostname:3211/database');
  }
);

test(
  'sqlite://filename.db',
  t => {
    const config = parseDatabaseString('sqlite://filename.db');
    t.is( config.engine, 'sqlite');
    t.is( config.filename, 'filename.db');
  }
);

test(
  'sqlite://:memory:',
  t => {
    const config = parseDatabaseString('sqlite://:memory:');
    t.is( config.engine, 'sqlite');
    t.is( config.filename, ':memory:');
  }
);

test(
  'sqlite:memory',
  t => {
    const config = parseDatabaseString('sqlite:memory');
    t.is( config.engine, 'sqlite');
    t.is( config.filename, ':memory:');
  }
);

test(
  'driverName://databaseName',
  t => {
    const config = parseDatabaseString('driverName://databaseName');
    t.is( config.engine, 'driverName');
    t.is( config.database, 'databaseName');
  }
);

test(
  'driverName://hostName/databaseName',
  t => {
    const config = parseDatabaseString('driverName://hostName/databaseName');
    t.is( config.engine, 'driverName');
    t.is( config.host, 'hostName');
    t.is( config.database, 'databaseName');
  }
);

test(
  'driverName://hostName:1234/databaseName',
  t => {
    const config = parseDatabaseString('driverName://hostName:1234/databaseName');
    t.is( config.engine, 'driverName');
    t.is( config.host, 'hostName');
    t.is( config.port, '1234');
    t.is( config.database, 'databaseName');
  }
);

test(
  'driverName://userName@hostName/databaseName',
  t => {
    const config = parseDatabaseString('driverName://userName@hostName/databaseName');
    t.is( config.engine, 'driverName');
    t.is( config.user, 'userName');
    t.is( config.host, 'hostName');
    t.is( config.database, 'databaseName');
  }
);

test(
  'driverName://userName@hostName:1234/databaseName',
  t => {
    const config = parseDatabaseString('driverName://userName@hostName:1234/databaseName');
    t.is( config.engine, 'driverName');
    t.is( config.user, 'userName');
    t.is( config.host, 'hostName');
    t.is( config.port, '1234');
    t.is( config.database, 'databaseName');
  }
);

test(
  'driverName://userName:secretPassword@hostName/databaseName',
  t => {
    const config = parseDatabaseString('driverName://userName:secretPassword@hostName/databaseName');
    t.is( config.engine, 'driverName');
    t.is( config.host, 'hostName');
    t.is( config.database, 'databaseName');
    t.is( config.user, 'userName');
    t.is( config.password, 'secretPassword');
  }
);

test(
  'driverName://userName:secretPassword@hostName:1234/databaseName',
  t => {
    const config = parseDatabaseString('driverName://userName:secretPassword@hostName:1234/databaseName');
    t.is( config.engine, 'driverName');
    t.is( config.host, 'hostName');
    t.is( config.port, '1234');
    t.is( config.user, 'userName');
    t.is( config.password, 'secretPassword');
    t.is( config.database, 'databaseName');
  }
);

test(
  'driverName:databaseName',
  t => {
    const error = t.throws( () => parseDatabaseString('driverName:databaseName') )
    t.is( error.message, 'Invalid "database" specified: driverName:databaseName');
  }
);

//-----------------------------------------------------------------------------
// databaseConfig()
//-----------------------------------------------------------------------------

test(
  "databaseConfig({ database: 'driverName://userName:secretPassword@hostName:1234/databaseName' })",
  t => {
    const config = databaseConfig({ database: 'driverName://userName:secretPassword@hostName:1234/databaseName' });
    t.is( config.engine, 'driverName');
    t.is( config.database.host, 'hostName');
    t.is( config.database.port, '1234');
    t.is( config.database.database, 'databaseName');
    t.is( config.database.user, 'userName');
    t.is( config.database.password, 'secretPassword');
  }
);

test(
  "databaseConfig({ database: { engine: 'sqlite', filename: 'wibble.db' } })",
  t => {
    const config = databaseConfig({ database: { engine: 'sqlite', filename: 'wibble.db' } });
    t.is( config.engine, 'sqlite');
    t.is( config.database.filename, 'wibble.db');
  }
);

test(
  "databaseConfig({ database: { engine: 'sqlite', file: 'wibble.db' } })",
  t => {
    const config = databaseConfig({ database: { engine: 'sqlite', file: 'wibble.db' } });
    t.is( config.engine, 'sqlite');
    t.is( config.database.filename, 'wibble.db');
  }
);

test(
  "databaseConfig() - parameter renaming",
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

test(
  "databaseConfig({ database: 'sqlite:memory', pool: { min: 1, max: 1 } })",
  t => {
    const config = databaseConfig({ database: 'sqlite:memory', pool: { min: 1, max: 1 } });
    t.is( config.engine, 'sqlite');
    t.is( config.database.filename, ':memory:');
    t.is( config.pool.min, 1 );
    t.is( config.pool.max, 1 );
  }
);

test(
  "databaseConfig({ database: 'driverName:databaseName' })",
  t => {
    const error = t.throws( () => databaseConfig({ database: 'driverName:databaseName' }) )
    t.is( error.message, 'Invalid "database" specified: driverName:databaseName');
  }
);

test(
  "databaseConfig({ })",
  t => {
    const error = t.throws( () => databaseConfig({ }) )
    t.is( error.message, 'No "database" specified');
  }
);

test(
  "configEnv({ DATABASE: '...' })",
  t => {
    const config = configEnv({ DATABASE: 'sqlite:memory' });
    t.deepEqual(config, { database: 'sqlite:memory' });
  }
);

test(
  "configEnv({ DATABASE_ENGINE: '...', DATABASE_HOST: '...' })",
  t => {
    const config = configEnv({ DATABASE_ENGINE: 'sqlite', DATABASE_FILENAME: ':memory:' });
    t.deepEqual(config, { database: { engine: 'sqlite', filename: ':memory:' } });
  }
);

test(
  "databaseConfig({ env: { DATABASE: ... }})",
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

test(
  "databaseConfig({ env: { DATABASE_ENGINE, etc., }})",
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

test(
  "databaseConfig({ env: { MY_DB: ... }, envPrefix: 'MY_DB', })",
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

test(
  "databaseConfig({ env: { MY_DB_ENGINE, etc., }, envPrefix: 'MY_DB' })",
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