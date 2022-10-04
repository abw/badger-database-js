export const one = async (record, spec={}) => {
  // console.log('relation:one record: ', record);
  // console.log('relation:one spec: ', spec);
  const lkey  = spec.localKey;
  const rkey  = spec.remoteKey;
  let where   = spec.where || { };
  if (lkey && rkey) {
    where[rkey] = record.row[lkey];
  }
  if (spec.debug) {
    console.log('one() relation: ', spec);
    console.log('one() relation table: ', spec.table);
    console.log('one() relation where: ', where);
  }
  const table = await record.database.table(spec.table);
  return await table.oneRecord(where);
}

export default one