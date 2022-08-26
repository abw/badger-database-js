export const rowProxy = table => query =>
  new Proxy(
    query,
    {
      get(target, prop) {
        if (prop === 'record') {
          return () => table.record(...arguments);
        }
        return target[prop];
      }
    }
  );

export default rowProxy

