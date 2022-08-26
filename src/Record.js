import { addDebug } from "@abw/badger";

export class Record {
  constructor(table, data, options={}) {
    this.table  = table;
    this.schema = table.schema;
    this.data   = data;
    addDebug(this, options.debug, options.debugPrefix || `${this.table} record`, options.debugColor);
    // console.log('created record: ', this.data);
  }
  hello() {
    return 'hello world';
  }
  sayHello() {
    console.log(this.hello());
  }
}

export const record = (table, data, options) => new Record(table, data, options)

export default Record;
