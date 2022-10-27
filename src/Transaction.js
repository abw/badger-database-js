import transactionProxy from "./Proxy/Transaction.js";
import Transactor from "./Transactor.js";
import { addDebugMethod, missing, TransactionError } from "./Utils/index.js";

export class Transaction {
  constructor(database, config={}) {
    this.database     = database || missing('database')
    this.engine       = database.engine
    this.completed    = false
    this.autoCommit   = config.autoCommit
    this.autoRollback = config.autoRollback
    addDebugMethod(this, 'transaction', config)
  }

  async run(code) {
    this.debug("run()");
    // const proxy    = transactionProxy(this.database, this);
    const actor    = this.database.transactor(Transactor, this);
    const commit   = this.commit.bind(this);
    const rollback = this.rollback.bind(this);
    try {
      // acquire a database connection
      await this.acquire();

      // begin a transaction
      await this.begin();

      // run the code
      await code(actor, commit, rollback)
      this.debug("code complete")

      // check that commit() or rollback() has been called
      if (! this.completed) {
        if (this.autoCommit) {
          this.debug("autoCommit");
          await this.commit();
        }
        else if (this.autoRollback) {
          this.debug("autoRollback");
          await this.rollback();
        }
        else {
          this.fail('Transaction was not committed or rolled back');
        }
      }
    }
    catch(e) {
      // if commit() or rollback() hasn't already been called then rollback
      // the transaction and rethrow the error
      if (! this.completed) {
        this.debug("caught error, rolling back transaction");
        await this.rollback();
      }
      throw(e);
    }
    finally {
      // release the database connection
      await this.release();
    }
  }

  async acquire() {
    this.debug("acquire()")
    if (this.connection) {
      this.fail('Transaction has already acquired a connection');
    }
    this.connection = await this.engine.acquire();
  }

  async release() {
    this.debug("release()")
    if (! this.connection) {
      this.fail('Transaction does not have a connection to release');
    }
    await this.engine.release(this.connection);
    delete this.connection;
  }

  async begin() {
    this.debug("begin()")
    this.engine.begin(this)
  }

  async commit() {
    this.debug("commit()")
    this.complete('commit')
    await this.engine.commit(this)
  }

  async rollback() {
    this.debug("rollback()")
    this.complete('rollback');
    await this.engine.rollback(this)
  }

  complete(action) {
    if (this.completed) {
      throw new TransactionError(`Cannot ${action} transaction - ${this.completed}() has already been called`)
    }
    this.completed = action;
  }

  fail(...args) {
    throw new TransactionError(args.join(''));
  }
}

export default Transaction
