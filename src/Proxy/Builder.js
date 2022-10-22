import { extract } from "@abw/badger-utils";
import { QueryBuilderError } from "../Utils/Error.js";

// In the usual case we have an object mapping methods names to
// builder classes (`builders`) and a `parent` object.  However a
// builder node can define a static subMethods item which defines
// the allowable methods that can follow it.  A new builder proxy
// is created with the `valid` object containing those that are
// permitted and `root` set to the keyword for the builder node.
// This allows us to generate a better error if an invalid method
// is added, e.g. "SELECT cannot be added to a DELETE query".

export const builderProxy = (builders, parent, valid, keyword) =>
  new Proxy(
    parent,
    {
      get(target, prop) {
        // console.log('builderProxy %s', prop);
        const bclass = valid
          ? valid[prop]
          : builders[prop];

        if (bclass) {
          // console.log('builderProxy builder: %s =>', prop, bclass);
          return (
            (...args) => {
              const builder   = new bclass(parent, ...args);
              const methods   = bclass.subMethods;
              if (methods) {
                return builderProxy(
                  builders, builder,
                  extract(builders, methods),
                  bclass.keyword
                )
              }
              else {
                return builderProxy(builders, builder)
              }
            }
          ).bind(target);
        }
        else if (builders[prop]) {
          throw new QueryBuilderError(`${prop}() is not a valid builder method for a ${keyword} query`);
        }
        else {
          return Reflect.get(target, prop);
        }
      }
    }
  );

export default builderProxy
