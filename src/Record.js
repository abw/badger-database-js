import relations from "./Relation/index.js";
import { fail } from "@abw/badger-utils";
import { addDebugMethod } from "./Utils/Debug.js";
import { throwDeletedRecordError } from "./Utils/Error.js";
import { relationConfig } from "./Utils/Relation.js";

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
  async relation(name) {
    this.debug('relation(%s)', name);
    return this.relations[name]
      ||=  await this.initRelation(name);
  }
  async initRelation(name) {
    this.debug('initRelation(%s)', name);
    const table = this.table.table;
    const relation = relationConfig(
      table, name,
      this.table.relations[name]
        || fail(`Invalid "${name}" relation specified for ${table} table`)
    )
    const rfunc = relations[relation.type]
      || fail(`Invalid "${relation.type}" relation type specified for ${name} relation in ${table} table`);
    return await rfunc(this, relation);
  }
}

export default Record;
