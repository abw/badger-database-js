import transactionProxy from "./Proxy/Transaction.js";
import { isBoolean } from "@abw/badger-utils";
import { addDebugMethod, missing, TransactionError } from "./Utils/index.js";

export class Transaction {
  constructor(database, config) {
    this.database     = database || missing('database');
    this.completed    = false;
    this.autoCommit   = isBoolean(config.autoCommit)   ? config.autoCommit   : false;
    this.autoRollback = ! config.autoCommit;
    addDebugMethod(this, 'transaction', config);
    this.debug('autoCommit: ', this.autoCommit);
    this.debug('autoRollback: ', this.autoRollback);
  }

  async run(code) {
    this.debug("run()");
    const proxy    = transactionProxy(this.database, this);
    const commit   = this.commit.bind(this);
    const rollback = this.rollback.bind(this);
    try {
      // acquire a database connection
      this.acquire();

      // run the code
      await code(proxy, commit, rollback)
      this.debug("code complete")

      // check that commit() or rollback() has been called
      if (! this.completed) {
        if (this.autoCommit) {
          this.debug("autoCommit");
          this.commit();
        }
        else if (this.autoRollback) {
          this.debug("autoRollback");
          this.rollback();
        }
        else {
          // in theory this should never happen because (at the time of writing)
          // we always autoRollback unless autoCommit is set
          throw new TransactionError('Transaction was not committed or rolled back');
        }
      }
    }
    catch(e) {
      // if commit() or rollback() hasn't already been called then rollback
      // the transaction and rethrow the error
      if (! this.completed) {
        this.debug("caught error, rolling back transaction");
        this.rollback();
      }
      throw(e);
    }
    finally {
      // release the database connection
      this.release();
    }
  }

  async acquire() {
    this.debug("acquire()")
    // TODO
  }

  async release() {
    this.debug("release()")
    // TODO
  }

  async commit() {
    this.debug("commit()")
    this.complete('commit');
    // TODO: commit transaction
  }

  async rollback() {
    this.debug("rollback()")
    this.complete('rollback');
    // TODO: rollback transaction
  }

  complete(action) {
    if (this.completed) {
      throw new TransactionError(`Cannot ${action} transaction - ${this.completed}() has already been called`)
    }
    this.completed = action;
  }

  tmpId() {
    return "TRANSACTION";
  }
}

export default Transaction
