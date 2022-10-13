import Simple from './Simple.js';

export class Offset extends Simple {
  static buildMethod = 'offset'

  initBuilder(offset) {
    this.value = offset;
  }
}

export default Offset
