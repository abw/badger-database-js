import { fail, noValue } from "@abw/badger-utils";

/**
 * Function to format strings by inserting values into placeholder locations.
 * @param {!String} msg - the source string
 * @param {Object} data - data items to insert into the string
 * @returns {String} - the expanded string
 * @example
 * format('Hello <name>!', { name: 'World'});  // Hello World!
 */
export const format = (msg, data) =>
  msg.replace(
    /<(\w+)>/g,
    (_, key) => {
      const val = data[key];
      if (noValue(val)) {
        fail(`Invalid variable expansion <${key}> in message format: ${msg}`);
      }
      return val;
    }
  );
