import { fail, noValue } from "@abw/badger-utils";

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
