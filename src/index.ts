import createServer from './server'
import SocketIO from 'socket.io'
import { createCore } from './core'
import { configureMessageHandlers } from './logic'
import seconds from './seconds'

const log = console.log

/** Port on which server listens */
const port: number = process.env.PORT || 3000
const server = createServer()
const socketIO = SocketIO(server)
const gameCore = createCore(socketIO)

configureMessageHandlers(gameCore, log, seconds)

server.listen(port, () => log(`🔥 Server is listening on port ${port} 🔥`))