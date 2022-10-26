import { isFunction } from "@abw/badger-utils";

class Foo {
  constructor() {
    this.hello = "Hello World";
  }
  bar(b) {
    console.log('bar:', b);
  }
  baz(b) {
    console.log('baz:', b);
  }
  barbaz() {
    this.bar('barbaz');
    this.baz('barbaz');
  }
}

const f = new Foo();
f.bar('bar');
f.baz('baz');
f.barbaz();
console.log('f.hello', f.hello);


const p = q => new Proxy(
  q,
  {
    get(target, prop) {
      const method = Reflect.get(target, prop);
      if (! method) {
        throw `Invalid method: ${prop}`
      }
      console.log('method: ', method);
      if (isFunction(method)) {
        return (
          function(a) {
            method.apply(p(target), [a?.toUpperCase()])
          }
        )
      }
      else {
        return method;
      }
    }
  }
)

const g = p(f);
g.bar('bar');
g.baz('baz');
g.barbaz();
console.log('g.hello', g.hello);

