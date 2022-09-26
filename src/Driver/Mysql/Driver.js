import mysql from 'mysql2/promise';
import Driver from '../../Driver.js';
import Query from './Query.js';
import { extract } from '../../Utils.js';
import { addDebug } from '@abw/badger';

export class MysqlDriver extends Driver {
  configure(config={}) {
    const debug = extract(config, /^debug/);
    addDebug(this, debug.debug, debug.debugPrefix || 'MysqlDriver> ', debug.debugColor || 'red');
    return config;
  }
  async connect() {
    this.debug("connect: ", this.config);
    return mysql.createConnection(this.config);
  }
  async connected() {
    this.debug("connected");
    return true;
  }
  async disconnect(db) {
    this.debug("disconnect");
    db.destroy();
  }
  async query(db, sql) {
    const query = await db.prepare(sql);
    return new Query(query);
  }
}

export default MysqlDriver