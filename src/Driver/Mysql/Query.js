import Query from '../../Query.js';

export class MysqlQuery extends Query {
  constructor(query) {
    super(query);
    this.query = query;
  }
  async execute(...params) {
    return this.query.run(...params);
  }
  async any(...params) {
    return this.query.all(...params);
  }
  async all(...params) {
    return this.query.all(...params);
  }
}

export default MysqlQuery