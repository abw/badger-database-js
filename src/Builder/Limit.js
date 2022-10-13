import Simple from './Simple.js';

export class Limit extends Simple {
  static buildMethod = 'limit'

  initBuilder(limit) {
    this.value = limit;
  }
}

export default Limit

