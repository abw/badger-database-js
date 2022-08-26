export const recordProxy = record =>
  new Proxy(
    record,
    {
      get(target, prop) {
        if (target.schema.allColumns[prop]) {
          return target.data[prop];
        }
        return target[prop];
      }
    }
  );

export default recordProxy
