import chalk from 'chalk'
import { argv } from 'yargs'

const log = (logger, message) => {
  if (logger && typeof logger === 'function') {
    logger(message)
  }
}

export default (apis = [], { force = false, enabled = true, logger = undefined } = {}) => {

  if (!(argv.mockups || enabled)) {
    return (req, res, next) => next()
  }

  log(logger, chalk.green('[MOCKUPS] Using mockups middleware to simulate backend apis'))
  log(logger, chalk.green('[MOCKUPS] Mocked apis:'))

  let availableApis = apis
  if (!(argv['force-mockups'] || force)) {
    availableApis = apis.filter(api => api.enabled !== false)
  }

  if (logger) {
    availableApis.forEach(api => {
      log(logger, chalk.green(`[MOCKUPS] ${api.pattern}`))
    })
  }

  return (req, res, next) => {
    const api = availableApis.find(a => req.url.match(new RegExp(a.pattern, 'g')))

    if (!api) {
      return next()
    }

    if (api.headers) {
      api.headers.map(header => res.setHeader(header.key, header.value))
    }

    const status = api.status || 200
    res.status(status)

    log(logger, chalk.green(`[MOCKUPS] Mocked api : [${status}] ${req.url}`))

    return res.send(api.body ? api.body(req) : '')
  }
}
