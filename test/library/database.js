import { connect as connect } from "../../src/Database.js";
import { invalid } from '../../src/Utils/Error.js';

export const sqlite   = 'sqlite:memory';
export const mysql    = 'mysql://test:test@localhost/test';
export const postgres = 'postgres://test:test@localhost/test';

const configs = {
  mysql, postgres, sqlite
}

export const databaseConfig = engine =>
  configs[engine] || invalid('engine', engine)

export const defaultConfig = {
  database: databaseConfig('sqlite'),
};

export const createDatabase = async (config=defaultConfig) => connect(config);

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


