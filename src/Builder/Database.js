import Builder from '../Builder.js';

export class Database extends Builder {
  initBuilder(database) {
    this.database = database;
  }
  resolve(context) {
    return {
      database: this.database,
      ...context,
    }
  }
}

export default Database