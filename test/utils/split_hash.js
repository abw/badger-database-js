import test from 'ava';
import { splitHash } from '../../src/Utils.js'


test(
  'splitHash({ a: true, b: true })',
  t => t.deepEqual(
    splitHash({ a: true, b: true }),
    { a: true, b: true }
  )
);

test(
  'splitHash({ a: 1, b: 2 })',
  t => t.deepEqual(
    splitHash({ a: 1, b: 2 }),
    { a: 1, b: 2 }
  )
);

test(
  'splitHash(["a", "b"])',
  t => t.deepEqual(
    splitHash(["a", "b"]),
    { a: true, b: true }
  )
);

test(
  'splitHash(["a", "b"], false)',
  t => t.deepEqual(
    splitHash(["a", "b"], false),
    { a: false, b: false }
  )
);

test(
  'splitHash(["a", "b"], undefined)',
  t => t.deepEqual(
    splitHash(["a", "b"], undefined),
    { a: true, b: true }
  )
);


test(
  'splitHash(["a", "b"], v => v)',
  t => t.deepEqual(
    splitHash(["a", "b"], v => v),
    { a: 'a', b: 'b' }
  )
);

test(
  'splitHash(["a", "b"], v => `=${v}=)',
  t => t.deepEqual(
    splitHash(["a", "b"], v => `=${v}=`),
    { a: '=a=', b: '=b=' }
  )
);

test(
  'splitHash(["a", "b"], undefined, { c: "hello" })',
  t => t.deepEqual(
    splitHash(["a", "b"], undefined, { c: "hello" }),
    { a: true, b: true, c: "hello" }
  )
);
