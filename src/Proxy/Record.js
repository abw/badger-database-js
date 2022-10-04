export const recordProxy = record =>
  new Proxy(
    record,
    {
      get(target, prop) {
        // console.log('recordProxy get(%s)', prop);
        // first look to see if the record has the property/method itself
        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop);
        }
        // then look to see if it's a data item
        if (Reflect.has(target.row, prop)) {
          return Reflect.get(target.row, prop);
        }
        // then look to see if it's a relation
        if (Reflect.has(target.table.relations, prop)) {
          // console.log('recordProxy column: ', prop);
          return target.relation(prop);
        }
        return Reflect.get(target, prop);
      }
    }
  );

export default recordProxy
