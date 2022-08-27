export const rowsProxy = table => query =>
  new Proxy(
    query,
    {
      get(target, prop) {
        if (prop === 'records') {
          return () => table.records(...arguments);
        }
        else if (prop === 'then') {
          return (
            fn => table.rowsProxy(target.then(fn))
          ).bind(target)
        }
        return target[prop];
      }
    }
  );

export default rowsProxy
