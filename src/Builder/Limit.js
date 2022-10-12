import Simple from './Simple.js';

export class Limit extends Simple {
  initBuilder(limit) {
    this.key   = 'limit';
    this.value = limit;
  }
}

export default Limit

