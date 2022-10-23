import { blank, lparen, rparen, space } from "../Constants.js";

export const spaceAfter = string =>
  (string && string.length)
    ? string + space
    : blank

export const spaceBefore = string =>
  (string && string.length)
    ? space + string
    : blank

export const spaceAround = string =>
  (string && string.length)
    ? space + string + space
    : blank

export const parens = string =>
  (string && string.length)
    ? lparen + string + rparen
    : blank