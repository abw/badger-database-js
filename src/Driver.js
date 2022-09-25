import { notImplementedInBaseClass } from "./Utils.js";

const notImplemented = notImplementedInBaseClass('Driver');

export class Driver {
  constructor(config={}) {
    this.config = this.configure(config);
  }
  configure(config) {
    return config;
  }
  //-----------------------------------------------------------------------------
  // connection
  //-----------------------------------------------------------------------------
  async connect() {
    notImplemented("connect()")
  }
  async connected() {
    notImplemented("connected()")
  }
  async disconnect() {
    notImplemented("disconnect()")
  }
  //-----------------------------------------------------------------------------
  // queries
  //-----------------------------------------------------------------------------
  async query() {
    notImplemented("query()")
  }
}

export default Driver