// Slightly more advanced version of that imported from badger-utils which
// has preserveCase option to NOT lower case the remainder of the word after
// the first character
interface CapitaliseOptions {
  preserveCase?: boolean
}
export function capitalise(
  word: string,
  options: CapitaliseOptions = { }
): string {
  const { preserveCase } = options
  const rest = word.slice(1)
  return word.charAt(0).toUpperCase() +
    ( preserveCase
      ? rest
      : rest.toLowerCase()
    )
}

export function snakeToStudly(
  snake: string,
  options: CapitaliseOptions = { }
): string {
  return snake.split('/').map(
    // each segment can be like foo_bar which we convert to FooBar
    segment => segment
      .split('_')
      .map(
        string => capitalise(string, options)
      )
      .join('')
  ).join('/')
}

export function snakeToStudlyPreserveCase(
  snake: string,
): string {
  return snakeToStudly(snake, { preserveCase: true })
}
