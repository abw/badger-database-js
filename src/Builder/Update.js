import From from './From.js';
import { comma, UPDATE } from '../Constants.js';

export class Update extends From {
  static buildMethod = 'update'
  static buildOrder  = 18
  static subMethods  = 'join set where order order_by limit returning'
  static keyword     = UPDATE
  static joint       = comma
}

export default Update