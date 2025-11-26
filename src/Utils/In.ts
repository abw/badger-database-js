import { IN, NOT_IN } from '../Constants'

const inOrNotIn = {
  [IN]:     IN,
  [NOT_IN]: NOT_IN
}
export const isIn = (value: string) => inOrNotIn[
  value.toUpperCase().replaceAll(/\s+/g, ' ')
]
