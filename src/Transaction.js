import transactionProxy from "./Proxy/Transaction.js";
import { missing } from "./Utils/Error.js";

export class Transaction {
  constructor(database) {
    this.database = database || missing('database');
  }
  async run(code) {
    const proxy = transactionProxy(this.database, this);
    await code(proxy);
  }
  tmpId() {
    return "TRANSACTION";
  }
}

export default Transaction
