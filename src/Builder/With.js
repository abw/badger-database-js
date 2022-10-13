import Builder from './Builder.js';
import { WITH } from '../Constants.js';

export class With extends Builder {
  static buildMethod = 'with'
  static buildOrder  = 10
  static keyword     = WITH
  // TODO
}

export default With

