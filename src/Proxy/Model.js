import { fail } from "@abw/badger-utils";

export const modelProxy = database =>
  new Proxy(
    database,
    {
      get(target, prop) {
        if (prop === 'then') {
          return Reflect.get(target, prop);
        }
        if (target.hasTable(prop)) {
          return target.table(prop);
        }
        return target[prop]
          || fail("Invalid table specified: ", prop);
      }
    }
  );

export default modelProxy
