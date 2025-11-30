import { whereRelation } from '../Utils/Relation'

export const one = async (record, spec={}) => {
  const where = whereRelation(record, spec);
  const table = await record.database.table(spec.table);
  return await table.oneRecord(where);
}

export default one