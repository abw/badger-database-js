import { databaseConfig } from "./Utils/Database.js";
import { invalid, missing } from "./Utils/Error.js";
import Mysql from './Engine/Mysql.js'
import Postgres from './Engine/Postgres.js'
import Sqlite from './Engine/Sqlite.js'

let Engines = { };

export const registerEngine = (name, module) => {
  Engines[name] = async config => {
    return new module(config);
  }
}

registerEngine('sqlite',     Sqlite);
registerEngine('mysql',      Mysql);
registerEngine('postgres',   Postgres);
registerEngine('postgresql', Postgres);

//-----------------------------------------------------------------------------
// Engine constructor
//-----------------------------------------------------------------------------
export const engine = async config => {
  config = databaseConfig(config);
  const engine = config.engine || missing('database.engine');
  const handler = Engines[engine] || invalid('database.engine', engine);
  return await handler(config);
}

export default Engines;
