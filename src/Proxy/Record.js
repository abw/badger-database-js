export const recordProxy = record =>
  new Proxy(
    record,
    {
      get(target, prop) {
        // console.log('recordProxy get(%s)', prop);
        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop);
        }
        if (Reflect.has(target.row, prop)) {
          // console.log('recordProxy column: ', prop);
          return Reflect.get(target.row, prop);
        }
        /*
        if (prop === 'then' && Reflect.has(target, prop)) {
          // console.log('recordProxy then: ', prop);
          return (
            fn => recordProxy(target.then(fn))
          ).bind(target)
        }
        */
        // console.log('recordProxy default: ', prop);
        return Reflect.get(target, prop);
      }
    }
  );

export default recordProxy
