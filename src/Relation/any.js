import { whereRelation } from "../Utils/Relation.js";

export const any = async (record, spec={}) => {
  const where = whereRelation(record, spec);
  const table = await record.database.table(spec.table);
  return await table.anyRecord(where);
}

export default any