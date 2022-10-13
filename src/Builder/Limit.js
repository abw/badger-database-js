import Simple from './Simple.js';
import { LIMIT } from '../Constants.js';

export class Limit extends Simple {
  static buildMethod = 'limit'
  static buildOrder  = 90
  static keyword     = LIMIT

  initBuilder(limit) {
    this.value = limit;
  }
}

export default Limit

