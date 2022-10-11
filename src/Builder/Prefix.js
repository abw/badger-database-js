import Builder from '../Builder.js';

export class Prefix extends Builder {
  initBuilder(prefix) {
    this.key    = 'prefix';
    this.prefix = prefix;
  }
  resolve(context) {
    this.context = {
      ...context,
      prefix: this.prefix
    }
    return this.context;
  }
}

export default Prefix

