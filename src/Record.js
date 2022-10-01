import relations from "./Relation/index.js";
import { fail } from "@abw/badger-utils";
import { addDebugMethod } from "./Utils/Debug.js";

export class Record {
  constructor(table, row, options={}) {
    this.table     = table;
    this.database  = table.database;
    this.row       = row;
    this.relations = { };
    addDebugMethod(this, 'record', { debugPrefix: `Record ${this.table}> ` }, options);
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

export default Record;
