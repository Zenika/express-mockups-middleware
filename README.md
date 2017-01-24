# express-mockups-middleware

## Requirements

You will need Node v6 or later version.

## What

This is an express `middleware`.
This middleware purpose is to serve mockups on proxified HTTP requests.
This is convenient during development to separate concerns.

## Install

`npm i --save-dev express-mockups-middleware`

## Use

You should pass an array of apis as first parameter of the middleware. api objects must respect the following structure.

Property  | Required | Type             | Default value | Description
----------|----------|------------------|---------------|-------------
`pattern` | yes      | String           | none          | A pattern that `request.url` property should match to be mocked. It will be passed as RegExp argument.
`enabled` | no       | Boolean          | `true`        | A boolean that determine if the middleware should handle this `api`.
`headers` | no       | Array of Objects | `[]`          | A array of objects ({key: '', value: ''}) that represents HTTP headers of the mocked `response`.
`status`  | no       | Number           | `200`         | A number that will be the `HTTP status` of the mocked `response`.
`body`    | no       | Function         | `() => ''`    | A function that take as parameter the `request` object and should return a string that will be the `message-body` of the mocked `response`.

You can also add an optional configuration object as second parameter.

Parameter | Required | Type             | Default value | Description
----------|----------|------------------|---------------|-------------
`enabled` | no       | Boolean          | `true`        | A boolean that determine if the middleware is `enabled` or not.
`force`   | no       | Boolean          | `false`       | Set to true it tells the middleware to ignore `enabled` property of `apis` objects.
`logger`  | no       | Function         | `() => {}`    | Pass your own logger function that takes a string as parameter.

The middleware call `next` function of `express` when no pattern is matched. Otherwise the `response` is instantly sent to client.

## Example

HTTP requests should be proxified otherwise the middleware won't work.

For it you could use `http-proxy-middleware`.

**server.js**
```javascript
import express from 'express'
import proxy from 'http-proxy-middleware'
import mockups from 'express-mockups-middleware'

const app = express()
const resources = ['Resource1','Resource2'];

app.use(mockups([
  {
    pattern: '/resources',
    body: (req) => JSON.stringify(resources)
  },
  {
    pattern: '/resources/(.*)',
    body: (req) => {
      const segments = req.url.split('/')
      return resources[segments[segments.length - 1]]
    }
  }
]));

app.use(proxy('/api', {
  target: `http://distant-backend.com`,
  logLevel: 'debug'
}));

app.listen(8080)
```

HTTP requests that match one of the patterns listed in apis parameter will be mocked but others will be sent to the proxified backend.
