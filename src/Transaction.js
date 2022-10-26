import transactionProxy from "./Proxy/Transaction.js";
import { missing } from "./Utils/Error.js";

export class Transaction {
  constructor(queryable) {
    this.queryable = queryable || missing('queryable');
    // this.engine    = queryable.engine || missing('engine');
  }
  async run(code) {
    const proxy = transactionProxy(this.queryable, this);
    await code(proxy);
  }
}

export default Transaction
