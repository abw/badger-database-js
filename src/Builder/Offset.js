import Simple from './Simple.js';
import { OFFSET } from '../Constants.js';

export class Offset extends Simple {
  static buildMethod = 'offset'
  static buildOrder  = 95
  static keyword     = OFFSET

  initBuilder(offset) {
    this.value = offset;
  }
}

export default Offset
