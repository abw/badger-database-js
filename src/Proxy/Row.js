export const rowProxy = table => query =>
  new Proxy(
    query,
    {
      get(target, prop) {
        if (prop === 'record') {
          return () => table.record(...arguments);
        }
        else if (prop === 'then') {
          return (
            fn => table.rowProxy(target.then(fn))
          ).bind(target)
        }
        return target[prop];
      }
    }
  );

export default rowProxy
