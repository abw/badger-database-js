import relations from "./Relation/index.js";
import { fail } from "@abw/badger-utils";
import { addDebugMethod } from "./Utils/Debug.js";
import { throwDeletedRecordError } from "./Utils/Error.js";

export class Record {
  constructor(table, row, config={}) {
    this.table     = table;
    this.database  = table.database;
    this.row       = row;
    this.relations = { };
    this.config    = config;
    addDebugMethod(this, 'record', { debugPrefix: `Record:${this.table.table}\n----------> ` }, config);

  }
  async update(set) {
    this.debugData("update()", { set });
    this.assertNotDeleted('update');
    const where = this.table.identity(this.row);
    const update = await this.table.updateOneRow(set, where, { reload: true });
    Object.assign(this.row, update);
    return this;
  }
  async delete() {
    this.debugData("delete()");
    this.assertNotDeleted('delete');
    const where = this.table.identity(this.row);
    await this.table.delete(where);
    this.deleted = true;
    return this;
  }
  assertNotDeleted(action) {
    if (this.deleted) {
      throwDeletedRecordError(
        'action',
        {
          action,
          table: this.table.table,
          id:    this.table.keys.map( key => this.row[key] ).join('/')
        }
      )
    }
  }
  relation(name) {
    this.debug('relation(%s)', name);
    return this.relations[name]
      ||=  this.initRelation(name);
  }
  initRelation(name) {
    this.debug('initRelation(%s)', name);
    const relation = this.table.relations[name] || fail("Invalid relation specified: ", name);
    const rfunc    = relations[relation.type] || fail("Invalid relation type: ", relation.type);
    relation.name ||= name;
    return rfunc(this, relation);
  }
}

export default Record;
