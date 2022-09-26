import { Pool, TimeoutError } from 'tarn';

let count = 1;
let spare = [ ];

const pool = new Pool({
  create: () => {
    const n = spare.length
      ? spare.shift()
      : count++;
    console.log(`create ${n}`);
    // return new Promise((resolve) => resolve(n));
    // return cb(null, n);
    // return new Promise((resolve) => resolve(n));
    return Promise.resolve(n);
  },
  validate: resource => {
    console.log('validating ' + resource);
    return true;
  },
  destroy: resource => {
    console.log(`release ${resource}`);
    spare.unshift(resource);
  },
  min: 2,
  max: 10,
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
  propagateCreateError: false
});

const main = async () => {
  const resource = await pool.acquire().promise;
  console.log('acquired: ', resource);
  pool.release(resource)
  await pool.destroy();
}

main();

/*
try {
  const resource = await acquire.promise;
} catch (err) {
  if (err instanceof TimeoutError) {
    console.log('timeout');
  }
}
*/