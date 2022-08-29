import { addDebug } from "@abw/badger";

export class Record {
  constructor(table, data, options={}) {
    this.table  = table;
    this.schema = table.schema;
    this.data   = data;
    addDebug(this, options.debug, options.debugPrefix || `${this.table} record`, options.debugColor);
  }
  update(set) {
    const where = this.schema.identity(this.data);
    return this.table.update(set, where).then(
      rows => {
        this.data = rows[0];
        return this;
      }
    )
  }
}

export const record = (table, data, options) => new Record(table, data, options)

export default Record;
