import { addDebug } from "@abw/badger";
import { fail } from "@abw/badger-utils";
import relations from "./Relation/index.js";

export class Record {
  constructor(table, data, options={}) {
    this.table     = table;
    this.schema    = table.schema;
    this.database  = table.database;
    this.data      = data;
    this.relations = { };
    addDebug(this, options.debug, options.debugPrefix || `<${this.schema.table}> record: `, options.debugColor);
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
  relation(name) {
    this.debug('relation(%s)', name);
    return this.relations[name]
      ||=  this.initRelation(name);
  }
  initRelation(name) {
    this.debug('initRelation(%s)', name);
    const relation = this.schema.relations[name] || fail("Invalid relation specified: ", name);
    const rfunc    = relations[relation.type] || fail("Invalid relation type: ", relation.type);
    relation.name ||= name;
    return rfunc(this, relation);
  }
}

export const record = (table, data, options) =>
  new Record(table, data, options)

export default Record;
