export const one = (record, spec={}) => {
  const lkey  = spec.localKey  || spec.local_key;
  const rkey  = spec.remoteKey || spec.remote_key;
  const where = { [rkey]: record.data[lkey] };
  if (spec.debug) {
    console.log('one() relation: ', spec);
    console.log('one() relation table: ', spec.table);
    console.log('one() relation where: ', where);
  }
  return record.database.table(spec.table).fetchRow(where).record();
}

export default one