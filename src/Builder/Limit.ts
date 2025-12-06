import Simple from './Simple'
import { LIMIT } from '../Constants'

export class Limit extends Simple<number> {
  static buildMethod = 'limit'
  static buildOrder  = 90
  static keyword     = LIMIT

  initBuilder(limit: number) {
    this.value = limit;
  }
}

export default Limit

