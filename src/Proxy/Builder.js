export const builderProxy = (builders, parent) =>
  new Proxy(
    parent,
    {
      get(target, prop) {
        // console.log('builderProxy %s', prop);
        if (builders[prop]) {
          return (
            (...args) => builderProxy(
              builders,
              new builders[prop](parent, ...args)
              // target.factory(parent, prop, ...args)
            )
          ).bind(target);
        }
        else {
          return Reflect.get(target, prop);
        }
      }
    }
  );

export default builderProxy
