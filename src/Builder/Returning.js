import Select from './Select.js';
import { RETURNING } from '../Constants'

export class Returning extends Select {
  static buildMethod = 'returning'
  static buildOrder  = 96
  static keyword     = RETURNING
}

export default Returning