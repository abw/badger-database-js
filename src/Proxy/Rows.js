export const rowsProxy = table => query =>
  new Proxy(
    query,
    {
      get(target, prop) {
        if (prop === 'records') {
          return () => table.records(...arguments);
        }
        return target[prop];
      }
    }
  );

export default rowsProxy
