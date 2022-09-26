const template = (strings, ...values) => {
  console.log('strings: ', strings);
  console.log('values: ', values);
  const output = [ ];
  strings.forEach(
    (string, i) => {
      output.push(string);
      if (i < values.length) {
        output.push(values[i]);
      }
    }
  );
  return output.join('');
}

const animal = 'cat';
const place = 'mat';
const foo = template`The ${animal} sat on the ${place} and shat`;

console.log('foo: ', foo);
