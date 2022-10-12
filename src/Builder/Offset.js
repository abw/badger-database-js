import Simple from './Simple.js';

export class Offset extends Simple {
  initBuilder(offset) {
    this.key   = 'offset';
    this.value = offset;
  }
}

export default Offset
