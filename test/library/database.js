import Database from "../../src/Database.js";

export const databaseConfig = {
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
  pool: {
    min: 2,
    max: 10,
  }
};

export const createDatabase = (config=databaseConfig) => new Database(config);

export const database = createDatabase();

