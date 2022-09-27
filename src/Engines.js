import { hasValue, isString } from "@abw/badger-utils";
import { invalid, missing } from "./Utils.js";

export let Engines = { };

export const registerEngine = (name, module) => {
  Engines[name] = async config => {
    const engimp = await import(module);
    const engcls = engimp.default;
    return new engcls(config);
  }
}

registerEngine('sqlite',   './Engine/Sqlite.js');
registerEngine('mysql',    './Engine/Mysql.js');
registerEngine('postgres', './Engine/Postgres.js');

//-----------------------------------------------------------------------------
// Engine constructor
//-----------------------------------------------------------------------------
export const engine = async config => {
  config = engineConfig(config);
  const driver = config.driver || missing('engine.driver');
  const handler = Engines[driver] || invalid('engine.driver', driver);
  return await handler(config);
}

//-----------------------------------------------------------------------------
// Engine configuration
//-----------------------------------------------------------------------------
// engineConfig(string)
// engineConfig({ driver: xxx, ... })
//-----------------------------------------------------------------------------
export const engineConfig = config => {
  let engine = config.engine || missing('engine');
  if (isString(engine)) {
    config.engine = engine = parseEngineString(engine);
  }
  config.driver ||= engine.driver || missing('engine driver');
  delete engine.driver;
  return config;
}

//-----------------------------------------------------------------------------
// Parse Engine String
//-----------------------------------------------------------------------------
// parseEngineString('postgresql://user:password@host:port/database')
// parseEngineString('sqlite://filename.db')
// parseEngineString('sqlite://:memory:')
// parseEngineString('sqlite:memory')
// parseEngineString('driver://user:password@host:port/database')
//                    1^^^^^   2^^^ 3^^^^^^^ 4^^^ 5^^^ 6^^^^^^^
//-----------------------------------------------------------------------------
const engineStringRegex = /^(\w+):\/\/(?:(?:(\w+)(?::(\w+))?@)?(\w+)(?::(\d+))?\/)?(\w+)/;
const engineStringElements = {
  driver:   1,
  user:     2,
  password: 3,
  host:     4,
  port:     5,
  database: 6,
};

export const parseEngineString = string => {
  let config = { };
  let match;
  if (string.match(/^postgresql:/)) {
    // special case for postgres which can handle a connectionString
    config.driver = 'postgres';
    config.connectionString = string;
  }
  else if ((match = string.match(/^sqlite:\/\/(.*)/))) {
    // special case for sqlite which only has a filename (or ":memory:")
    config.driver   = 'sqlite';
    config.filename = match[1];
  }
  else if (string === 'sqlite:memory') {
    // special case for sqlite allowing 'sqlite:memory' as short for 'sqlite://:memory:'
    config.driver   = 'sqlite';
    config.filename = ':memory:';
  }
  else if ((match = string.match(engineStringRegex))) {
    // all other cases (e.g. mysql)
    Object.entries(engineStringElements).map(
      ([key, index]) => {
        const value = match[index];
        if (hasValue(value)) {
          config[key] = value;
        }
      }
    );
  }
  else {
    invalid('engine', string);
  }
  return config;
}

export default Engines;
