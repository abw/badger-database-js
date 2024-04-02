import { IN, NOT_IN } from '../Constants.js';

const inOrNotIn = {
  [IN]:     IN,
  [NOT_IN]: NOT_IN
}
export const isIn = value => inOrNotIn[
  value.toUpperCase().replaceAll(/\s+/g, ' ')
]
