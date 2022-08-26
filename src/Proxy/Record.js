export const recordProxy = record =>
  new Proxy(
    record,
    {
      get(target, prop) {
        if (target.schema.allColumns[prop]) {
          //console.log("it's a column: ", target.data[prop]);
          return target.data[prop];
        }
        return target[prop];
      }
    }
  );

export default recordProxy
