import { fail, isArray, isFunction, isObject, isString, splitHash } from "@abw/badger-utils"

export const missing = (item) =>
  fail(`No "${item}" specified`)

export const invalid = (item, value) =>
  fail(`Invalid "${item}" specified: ${value}`)

export const notImplemented = (method, module) =>
  fail(`${method} is not implemented in ${module}`)

export const notImplementedInModule = module => method =>
  notImplemented(method, module)

export const notImplementedInBaseClass = module =>
  notImplementedInModule(`the ${module} base class`)

export const extract = (object, spec, del=true) => {
  let matcher;
  let extracted = { };

  if (isFunction(spec)) {
    matcher = spec;
  }
  else if (spec instanceof RegExp) {
    matcher = key => spec.test(key);
  }
  else if (isObject(spec)) {
    matcher = key => spec[key];
  }
  else if (isArray(spec) || isString(spec)) {
    const specHash = splitHash(spec);
    matcher = key => specHash[key];
  }
  else {
    fail("Invalid specification for extract(): " + spec);
  }
  Object.keys(object).map(
    key => {
      if (matcher(key)) {
        // console.log('extracting ', key);
        extracted[key] = object[key];
        if (del) {
          delete object[key];
        }
      }
    }
  )
  return extracted;
}