export const modelProxy = database =>
  new Proxy(
    database,
    {
      get(target, prop) {
        if (target.hasTable(prop)) {
          return target.table(prop);
        }
        return target[prop];
      }
    }
  );

export default modelProxy
