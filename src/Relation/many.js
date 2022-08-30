export const many = (record, spec={}) => {
  const lkey  = spec.localKey  || spec.local_key;
  const rkey  = spec.remoteKey || spec.remote_key;
  const where = { [rkey]: record.data[lkey] };
  if (spec.debug) {
    console.log('many() relation: ', spec);
    console.log('many() relation table: ', spec.table);
    console.log('many() relation where: ', where);
  }
  return record.database.table(spec.table).fetchAll(where).records();
}

export default many