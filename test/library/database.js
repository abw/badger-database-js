import { connect as connect } from "../../src/Database.js";

export const databaseConfig = {
  database: 'sqlite:memory',
};

export const createDatabase = async (config=databaseConfig) => connect(config);

export const database = createDatabase();

export class MockDatabase {
  raw(...args) {
    return "[RAW:" + args.join(':') + "]";
  }
  quote(name) {
    return name
      .split(/\./)
      .map( part => '"' + part + '"')
      .join('.');
  }
}

export const mockDatabase = new MockDatabase();


