import http from 'http'
import Express from 'express'

/** Creates basic HTTP server */
const createServer = (): http.Server => {
  const app = Express()
  const server = http.createServer(app)

  // When someone enters the server address in browser,
  // it shows this basic website
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      </html>
      <html lang="en">
        <head>
          <title>The Black Cat - Server</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link href="https://bootswatch.com/paper/bootstrap.min.css" rel="stylesheet">
          <style>
            body {
              background-color: DarkSlateGray;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-content: center;
              width: 100vw;
              height: 100vh;
              text-align: center;
            }
          </style>
        </head>
        <body>
            <h1 style="color: Beige;">The Black Cat</h1>
            <h2 style="color: BurlyWood;">The server is up and running</h2>
        </body>
      </html>
    `)
  })

  return server
}

export default createServer