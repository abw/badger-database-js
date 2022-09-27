import test from 'ava';
import { engineConfig, parseEngineString } from "../../src/Engines.js";


//-----------------------------------------------------------------------------
// parseEngineString()
//-----------------------------------------------------------------------------
test(
  'postgresql://user:password@hostname:3211/database',
  t => {
    const config = parseEngineString('postgresql://user:password@hostname:3211/database');
    t.is( config.driver, 'postgres');
    t.is( config.connectionString, 'postgresql://user:password@hostname:3211/database');
  }
);

test(
  'sqlite://filename.db',
  t => {
    const config = parseEngineString('sqlite://filename.db');
    t.is( config.driver, 'sqlite');
    t.is( config.filename, 'filename.db');
  }
);

test(
  'sqlite://:memory:',
  t => {
    const config = parseEngineString('sqlite://:memory:');
    t.is( config.driver, 'sqlite');
    t.is( config.filename, ':memory:');
  }
);

test(
  'sqlite:memory',
  t => {
    const config = parseEngineString('sqlite:memory');
    t.is( config.driver, 'sqlite');
    t.is( config.filename, ':memory:');
  }
);

test(
  'driverName://databaseName',
  t => {
    const config = parseEngineString('driverName://databaseName');
    t.is( config.driver, 'driverName');
    t.is( config.database, 'databaseName');
  }
);

test(
  'driverName://hostName/databaseName',
  t => {
    const config = parseEngineString('driverName://hostName/databaseName');
    t.is( config.driver, 'driverName');
    t.is( config.host, 'hostName');
    t.is( config.database, 'databaseName');
  }
);

test(
  'driverName://hostName:1234/databaseName',
  t => {
    const config = parseEngineString('driverName://hostName:1234/databaseName');
    t.is( config.driver, 'driverName');
    t.is( config.host, 'hostName');
    t.is( config.port, '1234');
    t.is( config.database, 'databaseName');
  }
);

test(
  'driverName://userName@hostName/databaseName',
  t => {
    const config = parseEngineString('driverName://userName@hostName/databaseName');
    t.is( config.driver, 'driverName');
    t.is( config.user, 'userName');
    t.is( config.host, 'hostName');
    t.is( config.database, 'databaseName');
  }
);

test(
  'driverName://userName@hostName:1234/databaseName',
  t => {
    const config = parseEngineString('driverName://userName@hostName:1234/databaseName');
    t.is( config.driver, 'driverName');
    t.is( config.user, 'userName');
    t.is( config.host, 'hostName');
    t.is( config.port, '1234');
    t.is( config.database, 'databaseName');
  }
);

test(
  'driverName://userName:secretPassword@hostName/databaseName',
  t => {
    const config = parseEngineString('driverName://userName:secretPassword@hostName/databaseName');
    t.is( config.driver, 'driverName');
    t.is( config.host, 'hostName');
    t.is( config.database, 'databaseName');
    t.is( config.user, 'userName');
    t.is( config.password, 'secretPassword');
  }
);

test(
  'driverName://userName:secretPassword@hostName:1234/databaseName',
  t => {
    const config = parseEngineString('driverName://userName:secretPassword@hostName:1234/databaseName');
    t.is( config.driver, 'driverName');
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
    const error = t.throws( () => parseEngineString('driverName:databaseName') )
    t.is( error.message, 'Invalid "engine" specified: driverName:databaseName');
  }
);

//-----------------------------------------------------------------------------
// engineConfig()
//-----------------------------------------------------------------------------

test(
  "engineConfig({ engine: 'driverName://userName:secretPassword@hostName:1234/databaseName' })",
  t => {
    const [driver, config] = engineConfig({ engine: 'driverName://userName:secretPassword@hostName:1234/databaseName' });
    t.is( driver, 'driverName');
    t.is( config.engine.host, 'hostName');
    t.is( config.engine.port, '1234');
    t.is( config.engine.database, 'databaseName');
    t.is( config.engine.user, 'userName');
    t.is( config.engine.password, 'secretPassword');
  }
);

test(
  "engineConfig({ engine: { driver: 'sqlite', filename: 'wibble.db' } })",
  t => {
    const [driver, config] = engineConfig({ engine: { driver: 'sqlite', filename: 'wibble.db' } });
    t.is( driver, 'sqlite');
    t.is( config.engine.filename, 'wibble.db');
  }
);

test(
  "engineConfig({ engine: 'sqlite:memory', pool: { min: 1, max: 1 } })",
  t => {
    const [driver, config] = engineConfig({ engine: 'sqlite:memory', pool: { min: 1, max: 1 } });
    t.is( driver, 'sqlite');
    t.is( config.engine.filename, ':memory:');
    t.is( config.pool.min, 1 );
    t.is( config.pool.max, 1 );
  }
);

test(
  "engineConfig({ engine: 'driverName:databaseName' })",
  t => {
    const error = t.throws( () => engineConfig({ engine: 'driverName:databaseName' }) )
    t.is( error.message, 'Invalid "engine" specified: driverName:databaseName');
  }
);

test(
  "engineConfig({ })",
  t => {
    const error = t.throws( () => engineConfig({ }) )
    t.is( error.message, 'No "engine" specified');
  }
);

