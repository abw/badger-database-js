import { whereRelation } from '../Utils/Relation'

export const many = async (record, spec={}) => {
  const where   = whereRelation(record, spec);
  const order   = spec.order;
  const options = order ? { order } : { };
  const table   = await record.database.table(spec.table);
  return await table.allRecords(where, options);
}

export default many
