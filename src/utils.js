import { outro } from '@clack/prompts'
import colors from 'picocolors'

export function exitProgram ({ code = 0, message = 'No se ha creado el commit' } = {}) {
  outro(colors.yellow(message))
  process.exit(code)
}

export function camelize (str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase()
  }).replace(/\s+/g, '')
}
