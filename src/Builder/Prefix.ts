import Builder, { BuilderContext } from '../Builder'

export class Prefix extends Builder {
  static buildMethod = 'prefix'
  prefix: string

  initBuilder(prefix: string) {
    this.prefix = prefix;
  }

  resolve(context: BuilderContext) {
    this.context = {
      ...context,
      prefix: this.prefix
    }
    return this.context;
  }
}

export default Prefix
