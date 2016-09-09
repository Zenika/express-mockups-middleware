import chalk from 'chalk'
import { argv } from 'yargs'

export default (apis = [], { force = false, enabled = true, logger = () => {} } = {}) => {
  if (!(argv.mockups || enabled)) {
    return (req, res, next) => next()
  }

  logger(chalk.green('[MOCKUPS] Using mockups middleware to simulate backend apis'))
  logger(chalk.green('[MOCKUPS] Mocked apis:'))

  let availableApis = apis
  if (!(argv['force-mockups'] || force)) {
    availableApis = apis.filter(api => api.enabled !== false)
  }

  availableApis.forEach(api => {
    logger(chalk.green(`[MOCKUPS] ${api.pattern}`))
  })

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

    logger(chalk.green(`[MOCKUPS] Mocked api : [${status}] ${req.url}`))

    return res.send(api.body ? api.body(req) : '')
  }
}
