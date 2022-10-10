import Operator from '../Operator.js';

export class Database extends Operator {
  initOperator(database) {
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