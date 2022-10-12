import { isInteger, isObject } from '@abw/badger-utils';
import Builder from '../Builder.js';

const messages = {
  arg:    'Invalid argument specified for query builder "<type>" component. Expected (from, to), (from) or object.',
  args:   'Invalid arguments with <n> items specified for query builder "<type>" component. Expected (from, to), (from) or object.',
  object: 'Invalid object with "<keys>" properties specified for query builder "<type>" component.  Valid properties are "from", "to", "limit" and "offset".',
}

export class Range extends Builder {
  initBuilder(...args) {
    this.key = 'range';
    this.messages = messages;

    if (args.length === 2) {
      this.args = this.twoNumberArgs(...args);
    }
    else if (args.length === 1) {
      const arg = args[0];
      if (isInteger(arg)) {
        this.args = this.oneNumberArg(arg);
      }
      else if (isObject(arg)) {
        this.args = this.objectArgs(arg);
      }
      else {
        this.errorMsg('arg');
      }
    }
    else {
      this.errorMsg('args', { n: args.length });
    }
  }
  twoNumberArgs(from, to) {
    return {
      offset: from,
      limit: (to - from) + 1
    }
  }
  oneNumberArg(from) {
    return {
      offset: from
    }
  }
  objectArgs(args) {
    if (args.from && args.to) {
      return this.twoNumberArgs(args.from, args.to);
    }
    else if (args.from) {
      return this.oneNumberArg(args.from);
    }
    else if (args.to) {
      return {
        limit: args.to + 1
      };
    }
    else if (args.limit || args.offset) {
      return {
        limit:  args.limit,
        offset: args.offset,
      }
    }
    else {
      this.errorMsg('object', { keys: Object.keys(args).sort().join(', ') });
    }
  }

  resolve(context) {
    this.context = {
      ...context,
      ...this.args,
    }
    return this.context;
  }
}

export default Range

