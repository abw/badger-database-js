import Builder, { BuilderContext } from '../Builder'
import { isInteger, isObject } from '@abw/badger-utils'

export type RangeBuilderObject = {
  from?: number
  to?: number
  limit?: number
  offset?: number
}

export class Range extends Builder {
  static buildMethod = 'range'
  static messages = {
    arg:    'Invalid argument specified for query builder "<method>" component. Expected (from, to), (from) or object.',
    args:   'Invalid arguments with <n> items specified for query builder "<method>" component. Expected (from, to), (from) or object.',
    object: 'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Valid properties are "from", "to", "limit" and "offset".',
  }

  initBuilder(...args: any[]) {
    if (args.length === 2) {
      const [from, to] = args
      this.args = this.twoNumberArgs(from, to)
    }
    else if (args.length === 1) {
      const arg = args[0]
      if (isInteger(arg)) {
        this.args = this.oneNumberArg(arg)
      }
      else if (isObject(arg)) {
        this.args = this.objectArgs(arg)
      }
      else {
        this.errorMsg('arg');
      }
    }
    else {
      this.errorMsg('args', { n: args.length });
    }
  }

  twoNumberArgs(from: number, to: number) {
    return {
      offset: from,
      limit: (to - from) + 1
    }
  }

  oneNumberArg(from: number) {
    return {
      offset: from
    }
  }

  objectArgs(args: RangeBuilderObject) {
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

  resolve(context: BuilderContext) {
    this.context = {
      ...context,
      ...this.args,
    }
    return this.context;
  }
}

export default Range

