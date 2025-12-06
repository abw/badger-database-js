import Builder, { BuilderContext } from '../Builder'
import { isArray } from '@abw/badger-utils'
import { spaceAfter } from '../Utils/Space'

// Base class for a couple of simple builders that
// only take a single value: Limit and Offset

export class Simple<T=any> extends Builder {
  static buildMethod = 'simple'

  static generateSQL(values) {
    const keyword = this.keyword;
    return spaceAfter(keyword)
      + (isArray(values) ? values.at(-1) : values);
  }

  value: T

  initBuilder(value: T) {
    this.value = value;
  }

  resolve(context: BuilderContext) {
    this.context = {
      ...context,
      [this.slot]: this.value
    }
    return this.context;
  }
}

export default Simple

