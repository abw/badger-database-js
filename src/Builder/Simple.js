import Builder from '../Builder.js';

export class Simple extends Builder {
  initBuilder(value) {
    this.key   = 'simple';
    this.value = value;
  }
  resolve(context) {
    this.context = {
      ...context,
      [this.key]: this.value
    }
    return this.context;
  }
}

export default Simple

