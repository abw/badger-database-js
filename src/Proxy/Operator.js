import { operators } from "../Operators.js";

export const operatorProxy = parent =>
  new Proxy(
    parent,
    {
      get(target, prop) {
        // console.log('operatorProxy %s', prop);
        if (operators[prop]) {
          return (
            (...args) => operatorProxy(target.factory(parent, prop, ...args))
          ).bind(target);
        }
        else {
          return Reflect.get(target, prop);
        }
      }
    }
  );

export default operatorProxy
