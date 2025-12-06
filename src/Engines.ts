import Engine from './Engine'
import Mysql from './Engine/Mysql'
import Postgres from './Engine/Postgres'
import Sqlite from './Engine/Sqlite'
import { splitList } from '@abw/badger-utils'
import { databaseConfig } from './Utils/Database'
import { invalid, missing } from './Utils/Error'
import { ConnectConfig, DatabaseConnection } from './types'

type EngineClass = new (config: DatabaseConnection) => Engine
type EngineConstructor = (config: DatabaseConnection) => Engine

let Engines: Record<string, EngineConstructor> = { }

export const registerEngine = (engine: EngineClass) => {
  const ructor   = (config: DatabaseConnection) => new engine(config)
  const protocol = (engine as unknown as typeof Engine).protocol;
  const alias    = (engine as unknown as typeof Engine).alias;
  [protocol, ...splitList(alias) as string[]].forEach(
    name => Engines[name] = ructor
  )
}

export const registerEngines = (...engines: EngineClass[]) =>
  engines.forEach(registerEngine)

registerEngines(Sqlite, Mysql, Postgres)

//-----------------------------------------------------------------------------
// Engine constructor
//-----------------------------------------------------------------------------
export const engine = (config: ConnectConfig) => {
  const connect = databaseConfig(config)
  const engine = connect.engine || missing('database.engine')
  const handler = Engines[engine] || invalid('database.engine', engine)
  return handler(connect)
}

export default Engines;
