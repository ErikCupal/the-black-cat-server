import http from 'http'
import Express from 'express'

/** Creates basic HTTP(S) server */
const createServer = (): http.Server => {
  const app = Express()
  const server = http.createServer(app)

  return server
}

export default createServer