'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _yargs = require('yargs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (logger, message) => {
  if (logger && typeof logger === 'function') {
    logger(message);
  }
};

exports.default = (apis = [], { force = false, enabled = true, logger = undefined } = {}) => {
  if (!(_yargs.argv.mockups || enabled)) {
    return (req, res, next) => next();
  }

  log(logger, _chalk2.default.green('[MOCKUPS] Using mockups middleware to simulate backend apis'));
  log(logger, _chalk2.default.green('[MOCKUPS] Mocked apis:'));

  let availableApis = apis;
  if (!(_yargs.argv['force-mockups'] || force)) {
    availableApis = apis.filter(api => api.enabled !== false);
  }

  if (logger) {
    availableApis.forEach(api => {
      log(logger, _chalk2.default.green(`[MOCKUPS] ${ api.pattern }`));
    });
  }

  return (req, res, next) => {
    const api = availableApis.find(a => req.url.match(new RegExp(a.pattern, 'g')));

    if (!api) {
      return next();
    }

    if (api.headers) {
      api.headers.map(header => res.setHeader(header.key, header.value));
    }

    const status = api.status || 200;
    res.status(status);

    log(logger, _chalk2.default.green(`[MOCKUPS] Mocked api : [${ status }] ${ req.url }`));

    return res.send(api.body ? api.body(req) : '');
  };
};