export const rowProxy = table => query =>
  new Proxy(
    query,
    {
      get(target, prop) {
        if (prop === 'record') {
          // console.log('calling record() on table: ', table);
          return () => table.record(...arguments);
        }
        else if (prop === 'then') {
          // console.log('calling then() on a table');
          const original = target.then.bind(target);
          return (
            (newThen) => original(value => newThen(value))
          ).bind(target);
        }
        return target[prop];
      }
    }
  );

export default rowProxy

