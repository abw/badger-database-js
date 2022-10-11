import { builders } from "../Builders.js";

export const builderProxy = parent =>
  new Proxy(
    parent,
    {
      get(target, prop) {
        // console.log('builderProxy %s', prop);
        if (builders[prop]) {
          return (
            (...args) => builderProxy(target.factory(parent, prop, ...args))
          ).bind(target);
        }
        else {
          return Reflect.get(target, prop);
        }
      }
    }
  );

export default builderProxy
