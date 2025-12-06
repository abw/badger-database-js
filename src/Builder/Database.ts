import Builder from '../Builder.js';
import { DatabaseInstance } from '../types'

export class Database extends Builder {
  database: DatabaseInstance

  initBuilder(database: DatabaseInstance) {
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