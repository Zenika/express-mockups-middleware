import sinon from 'sinon'
import mocksHttp from 'node-mocks-http'
import middleware from './index'

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const getTestResult = (url = '', config) => {
  const {
    apis = [],
    force = false,
    enabled = true,
  } = config || {}

  const next = sinon.spy()
  const req = mocksHttp.createRequest({ url })
  const res = mocksHttp.createResponse()
  sinon.spy(res, 'send')

  middleware(apis, { force, enabled })(req, res, next)

  return { next, req, res }
}

describe('express-mockups-middleware', () => {
  describe('calling next function', () => {
    it('should call next when "mockups" CLI argument is not present or "enabled" argument equals false', () => { // eslint-disable-line max-len
      const { next } = getTestResult('', { enabled: false })

      next.called.should.be.true
    })

    it('should call next if pattern is not matched', () => {
      const { next } = getTestResult('/api/that/dont/match', {
        apis: [{ pattern: '/api/that/match' }],
      })

      next.called.should.be.true
    })

    it('should call next if pattern matched but "enabled" property equals false', () => {
      const { next } = getTestResult('/api/that/dont/match', {
        apis: [{ pattern: '/api/that/match', enabled: false }],
      })

      next.called.should.be.true
    })
  })
  describe('force-mode', () => {
    it('should not call next if pattern matched and "enabled" property equals false but "force" mode is enabled', () => { // eslint-disable-line max-len
      const { next, res } = getTestResult('/api/that/match', {
        apis: [{ pattern: '/api/that/match', enabled: false }],
        force: true,
      })

      next.called.should.be.false
      res.send.called.should.be.true
    })
  })
  describe('general', () => {
    it('should call send if pattern matched and "enabled" property equals true or undefined', () => { // eslint-disable-line max-len
      const { next, res } = getTestResult('/api/that/match', {
        apis: [{ pattern: '/api/that/match' }],
      })

      next.called.should.be.false
      res.send.called.should.be.true
    })

    it('should status equals to 200 by default', () => { // eslint-disable-line max-len
      const { next, res } = getTestResult('/api/that/match', {
        apis: [{ pattern: '/api/that/match' }],
      })

      next.called.should.be.false
      res.send.called.should.be.true
      res.statusCode.should.be.equal(200)
    })

    it('should status equals to status property', () => { // eslint-disable-line max-len
      const status = 500
      const { next, res } = getTestResult('/api/that/match', {
        apis: [{ pattern: '/api/that/match', status }],
      })

      next.called.should.be.false
      res.send.called.should.be.true
      res.statusCode.should.be.equal(status)
    })

    it('should add headers', () => {
      const customHeader = { key: 'CUSTOM-HEADER', value: 'This is a custom header' }
      const { next, res } = getTestResult('/api/that/match', {
        apis: [{ pattern: '/api/that/match', headers: [customHeader] }],
      })

      next.called.should.be.false
      res.send.called.should.be.true
      res._headers.should.have.property(customHeader.key, customHeader.value) // eslint-disable-line no-underscore-dangle, max-len
    })

    it('should send an empty string as default body', () => {
      const { next, res } = getTestResult('/api/that/match', {
        apis: [{ pattern: '/api/that/match', body: () => '' }],
      })

      next.called.should.be.false
      res.send.called.should.be.true
      res._getData().should.be.equal('') // eslint-disable-line no-underscore-dangle
    })

    it('should send body equals to the result of body function', () => {
      const body = 'The body that should be sent'
      const { next, res } = getTestResult('/api/that/match', {
        apis: [{ pattern: '/api/that/match', body: () => body }],
      })

      next.called.should.be.false
      res.send.called.should.be.true
      res._getData().should.be.equal(body) // eslint-disable-line no-underscore-dangle
    })

    it('should send body of first pattern matched', () => {
      const body = 'The body that should be sent'
      const { next, res } = getTestResult('/api/that/match', {
        apis: [
          {
            pattern: '/api/that/match',
            body: () => body,
          },
          {
            pattern: '/api/that/match',
            body: () => 'The body that should not be sent',
          },
        ],
      })

      next.called.should.be.false
      res.send.called.should.be.true
      res._getData().should.be.equal(body) // eslint-disable-line no-underscore-dangle
    })
  })
})

/* eslint-enable no-unused-expressions */
