export const many = async (record, spec={}) => {
  const lkey  = spec.localKey;
  const rkey  = spec.remoteKey;
  const order = spec.orderBy || spec.order;
  let where   = spec.where   || { };
  if (lkey && rkey) {
    where[rkey] = record.row[lkey];
  }
  const options = order ? { order } : { };
  if (spec.debug) {
    console.log('many() relation: ', spec);
    console.log('many() relation table: ', spec.table);
    console.log('many() relation where: ', where);
  }
  const table = await record.database.table(spec.table);
  return await table.allRecords(where, options);
}

export default many
