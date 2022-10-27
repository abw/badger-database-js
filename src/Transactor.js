import Database from './Database.js';

export class Transactor extends Database {
  constructor(engine, config, transaction) {
    super(engine, config);
    this.transaction = transaction;
  }
  buildQuery(source, config={}) {
    this.debugData("buildQuery()", { source });
    return super.buildQuery(
      source,
      { ...config, transaction: this.transaction }
    )
  }
  async table(name, options={}) {
    return super.table(
      name,
      { ...options, transaction: this.transaction }
    )
  }
  async commit() {
    await this.transaction.commit();
  }
  async rollback() {
    await this.transaction.rollback();
  }
}

export default Transactor