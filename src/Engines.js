import Mysql from './Engine/Mysql.js'
import Postgres from './Engine/Postgres.js'
import Sqlite from './Engine/Sqlite.js'
import { splitList } from "@abw/badger-utils";
import { databaseConfig } from "./Utils/Database.js";
import { invalid, missing } from "./Utils/Error.js";

let Engines = { };

export const registerEngine = engine => {
  const ructor = config => new engine(config);
  [engine.protocol, ...splitList(engine.alias)].forEach(
    name => Engines[name] = ructor
  )
}

export const registerEngines = (...engines) =>
  engines.forEach(registerEngine)

registerEngines(Sqlite, Mysql, Postgres);

//-----------------------------------------------------------------------------
// Engine constructor
//-----------------------------------------------------------------------------
export const engine = config => {
  const connect = databaseConfig(config)
  const engine = connect.engine || missing('database.engine');
  const handler = Engines[engine] || invalid('database.engine', engine);
  return handler(connect);
}

export default Engines;
