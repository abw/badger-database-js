import { database as connect } from "../../src/Database.js";

export const databaseConfig = {
  engine: 'sqlite:memory',
};

export const createDatabase = async (config=databaseConfig) => connect(config);

export const database = createDatabase();

export class MockDatabase {
  raw(...args) {
    return "[RAW:" + args.join(':') + "]";
  }
  escape(name) {
    return name
      .split(/\./)
      .map( part => '"' + part + '"')
      .join('.');
  }
}

export const mockDatabase = new MockDatabase();


