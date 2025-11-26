import { blank, lparen, rparen, space } from '../Constants'

export const spaceAfter = (string?: string) =>
  (string && string.length)
    ? string + space
    : blank

export const spaceBefore = (string?: string) =>
  (string && string.length)
    ? space + string
    : blank

export const spaceAround = (string?: string) =>
  (string && string.length)
    ? space + string + space
    : blank

export const parens = (string?: string) =>
  (string && string.length)
    ? lparen + string + rparen
    : blank