import { whereRelation } from '../Utils/Relation'

export const map = async (record, spec={}) => {
  const where   = whereRelation(record, spec);
  const key     = spec.key || record.table.id;
  const value   = spec.value;
  const table   = await record.database.table(spec.table);
  const records = await table.allRecords(where);
  return records.reduce(
    (hash, record) => {
      hash[record[key]] = spec.value ? record[value] : record;
      return hash
    },
    { }
  );
}

export default map