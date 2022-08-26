const proxy1 = new Proxy(
  {
    message1: "hello",
    message2: "everyone"
  },
  {
    get(target, prop) {
      if (prop === "message2") {
        return "world";
      }
      return Reflect.get(...arguments);
    },
  }
);

console.log('Hello: ', proxy1.message1);
console.log('World: ', proxy1.message2);

class Target {
  message1() {
    return "hello";
  }
  message2() {
    return "everyone";
  }
}

const proxy2 = new Proxy(
  new Target(),
  {
    get(target, prop) {
      if (prop === "message2") {
        return () => "world";
      }
      return Reflect.get(...arguments);
    },
  }
);

console.log('Hello: ', proxy2.message1());
console.log('World: ', proxy2.message2());

const proxy3 = new Proxy(
  {
    message1: "hello",
    message2: "everyone",
    greet:    name => console.log('Hello ', name),

  },
  {
    get(target, prop) {
      if (prop === "message2") {
        return "world";
      }
      return Reflect.get(...arguments);
    },
  }
);

console.log('Hello: ', proxy3.message1);
console.log('World: ', proxy3.message2);
proxy3.greet();
proxy3.greet('Andy');

const greetSoon = v => new Promise((resolve, reject) => setTimeout(() => resolve(v), 1000))
const greeter = greetSoon(proxy3);
// let greeter = new Proxy(prom, handler);
greeter.then(
  v => v.greet('Badger fans!')
)

/*
===
// using ES6 Proxy to deal with methods of Promise'd objects. works for me in Edge though not Chrome somehow.
let handler = {
  get: (target, prop) => function() {
    if(target instanceof Promise) {
      let args = arguments;
      return target.then((o) => o[prop].apply(o, args));
    } else {
      let value = target[prop];
      return typeof value == 'function' ? value.bind(target) : value;
    }
  }
};

let obj = { greet: (name) => console.log('Hey ' + name) };
let later = (v) => new Promise((resolve, reject) => setTimeout(() => resolve(v), 1000))
let prom = later(obj);
let greeter = new Proxy(prom, handler);
greeter.greet('you');

===

const projectPromiseValueProxy = (aPromise, projectTo) =>
  new Proxy(aPromise, {
    get: (targetPromise, prop) => {

      // project value of the first .then
      if (prop === 'then') {
        const originalThen = targetPromise.then.bind(targetPromise);

        const newThen = (function (userThenFunction) {
          return originalThen(value => userThenFunction(projectTo(value)));
        }).bind(targetPromise);

        return newThen;
      }

      // when we have `promise.catch().finally().then()` (i.e finally/catch before first .then)
      // we need to proxy until we find our first .then
      if (prop === 'finally' || prop === 'catch') {
        const originalFinallyOrCatch = targetPromise[prop].bind(targetPromise);

        const newFinallyOrCatch = (function (userFinallyFunction) {
          return projectPromiseValueProxy(originalFinallyOrCatch(userFinallyFunction), projectTo);
        }).bind(targetPromise);

        return newFinallyOrCatch;
      }

      return targetPromise[prop];
    },
  });

const promise = new Promise(resolve => setTimeout(() => resolve({ body: 42 }), 1000));

const projectedPromise = projectPromiseValueProxy(promise, (value) => value.body * 10);

projectedPromise
  .catch(console.error)
  .then(response => {
    console.log(response); // prints 420
    return { whatever: response };
  })
  .then(response => console.log(response)) // prints {whatever: 420} (i.e 2nd then its not proxied at all)
  .finally(() => console.log('finito'))
*/