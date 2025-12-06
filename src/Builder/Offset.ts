import Simple from './Simple'
import { OFFSET } from '../Constants'

export class Offset extends Simple<number> {
  static buildMethod = 'offset'
  static buildOrder  = 95
  static keyword     = OFFSET

  initBuilder(offset: number) {
    this.value = offset;
  }
}

export default Offset
