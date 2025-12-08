import { IN, NOT_IN } from '../Constants'

const inOrNotIn: Record<string, string> = {
  [IN]:     IN,
  [NOT_IN]: NOT_IN
}

export const isInOrNotIn = (value: string) => inOrNotIn[
  value.toUpperCase().replaceAll(/\s+/g, ' ')
]
