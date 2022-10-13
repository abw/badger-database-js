import { isArray } from '@abw/badger-utils';
import Builder from '../Builder.js';
import { spaceAfter } from '../Utils/Space.js';

export class Simple extends Builder {
  static buildMethod = 'simple'

  static generateSQL(values) {
    const keyword = this.keyword;
    return spaceAfter(keyword)
      + (isArray(values) ? values.at(-1) : values);
  }

  initBuilder(value) {
    this.value = value;
  }

  resolve(context) {
    this.context = {
      ...context,
      [this.slot]: this.value
    }
    return this.context;
  }
}

export default Simple

