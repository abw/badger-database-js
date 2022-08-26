import Database from "../../src/Database.js";

export const databaseConfig = {
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
};

export const createDatabase = (config=databaseConfig) => new Database(config);

export const database = createDatabase();

