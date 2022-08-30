export const recordProxy = record =>
  new Proxy(
    record,
    {

      get(target, prop) {
        // console.log('recordProxy get(%s) on ', prop, target);
        if (target.schema.allColumns[prop]) {
          // console.log('recordProxy column: ', prop);
          return target.data[prop];
        }
        else if (target.schema.relations?.[prop]) {
          // console.log('recordProxy relation: ', prop);
          return target.relation(prop);
        }
        //else if (prop === 'then') {
        //  console.log('recordProxy.then');
        //  return (
        //    fn => recordProxy(target.then(fn))
        //  ).bind(target)
        //}
        return target[prop];
      }
    }
  );

export default recordProxy
