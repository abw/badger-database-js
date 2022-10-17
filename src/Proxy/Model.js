export const modelProxy = database =>
  new Proxy(
    database,
    {
      get(target, prop) {
        if (prop === 'then') {
          return Reflect.get(target, prop);
        }
        return target.table(prop);
      }
    }
  );

export default modelProxy
