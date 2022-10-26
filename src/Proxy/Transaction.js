
export const transactionProxy = (queryable, transaction) =>
  new Proxy(
    queryable,
    {
      get(target, prop) {
        if (prop === 'buildQuery') {
          // console.log('buildQuery() proxy wrapper');
          return (function (source, config={}) {
            // console.log('adding transaction to buildQuery() config');
            return this.buildQuery(source, { ...config, transaction })
          }).bind(target)
        }
        if (prop === 'tmpId') {
          const id = target.tmpId();
          return (function () {
            return `proxy [${id}]`;
          }).bind(target);
        }
        return Reflect.get(target, prop);
      }
    }
  );

export default transactionProxy
