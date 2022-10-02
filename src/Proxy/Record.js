export const recordProxy = record =>
  new Proxy(
    record,
    {
      get(target, prop) {
        // console.log('recordProxy get(%s)', prop);
        if (Reflect.has(target.row, prop)) {
          // console.log('recordProxy column: ', prop);
          return Reflect.get(target.row, prop);
        }
        //else if (target.schema.relations?.[prop]) {
        //  console.log('recordProxy relation: ', prop);
        //  // console.log('recordProxy relation: ', prop);
        //  return target.relation(prop);
        //}
        else if (prop === 'then') {
          // console.log('recordProxy.then');
          if (Reflect.has(target, 'then')) {
            return (
              fn => target.then(fn)
              //fn => recordProxy(target.then(fn))
            ).bind(target)
          }
          else {
          // console.log('target: ', target);
            return target;
          }
          //return (
          //  fn => target.then(fn)
          //  //fn => recordProxy(target.then(fn))
          //).bind(target)
        }
        // console.log('recordProxy default: ', prop);
        return Reflect.get(target, prop);
      }
    }
  );

export default recordProxy
