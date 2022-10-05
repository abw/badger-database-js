import { databaseConfig } from "./Utils/Database.js";
import { invalid, missing } from "./Utils/Error.js";

let Engines = { };

export const registerEngine = (name, module) => {
  Engines[name] = async config => {
    const engimp = await import(module);
    const engcls = engimp.default;
    return new engcls(config);
  }
}

registerEngine('sqlite',     './Engine/Sqlite.js');
registerEngine('mysql',      './Engine/Mysql.js');
registerEngine('postgres',   './Engine/Postgres.js');
registerEngine('postgresql', './Engine/Postgres.js');

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
