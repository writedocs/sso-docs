const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset:' \x1b[0m',
}

const success = (message) => {
  console.log(colors.green, message, colors.reset);
}

const alert = (message) => {
  console.log(colors.yellow, message, colors.reset);
}

const error = (message) => {
  console.log(colors.red, message, colors.reset);
}

module.exports = {
  ...colors,
  error,
  alert,
  success,
}