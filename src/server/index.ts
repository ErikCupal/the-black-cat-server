import { homePage } from './homePage'
import http from 'http'
import Express from 'express'

/** Creates basic HTTP server */
const createServer = (): http.Server => {
  const app = Express()
  const server = http.createServer(app)

  // Routes to the root of server address when opened in a browser
  app.get('/', (req, res) => {
    res.send(homePage)
  })

  return server
}

export default createServer