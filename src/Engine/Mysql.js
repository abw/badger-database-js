import mysql from 'mysql2/promise';
import Engine from '../Engine.js';
import { missing } from '../Utils.js';

export class SqliteEngine extends Engine {
  configure(config) {
    this.connection = config.connection || missing('connection');
    config.debugPrefix ||= 'MysqlEngine> ';
    return config;
  }

  //-----------------------------------------------------------------------------
  // Pool connections methods
  //-----------------------------------------------------------------------------
  async connect() {
    this.debug("connect: ", this.connection);
    return mysql.createConnection(this.connection);
  }
  async connected() {
    this.debug("connected");
    return true;
  }
  async disconnect(connection) {
    this.debug("disconnect");
    connection.destroy();
  }

  //-----------------------------------------------------------------------------
  // Query methods
  //-----------------------------------------------------------------------------
  async prepare(connection, sql) {
    return await connection.prepare(sql);
  }
  async run(sql, ...params) {
    const [result] = await this.execute(sql, query => query.execute(params));
    return result;
  }
  async any(sql, ...params) {
    const [rows] = await this.execute(sql, query => query.execute(params));
    return rows[0];
  }
  async all(sql, ...params) {
    const [rows] = await this.execute(sql, query => query.execute(params));
    return rows;
  }
}

export default SqliteEngine