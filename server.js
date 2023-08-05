const next = require('next')

// note the "https" not "http" required module. You will get an error if trying to connect with https
const https= require('https')

const { parse } = require("url");

const fs = require("fs");

const hostname = 'localhost'
const port = 3001

const dev = process.env.NODE_ENV !== 'production'
  
const app = next({dev, hostname, port });

const sslOptions = {
    key: fs.readFileSync("./.certs/localhost-key.pem"),
    cert: fs.readFileSync("./.certs/localhost.pem")
}

const handle = app.getRequestHandler()

app.prepare().then(() => {
    https.createServer(sslOptions, async (req, res) => {
      try {
        // Be sure to pass `true` as the second argument to `url.parse`.
        // This tells it to parse the query portion of the URL.
        const parsedUrl = parse(req.url, true)
   
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        res.statusCode = 500
        res.end('internal server error')
      }
    })
      .once('error', (err) => {
        console.error(err)
        process.exit(1)
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
      })
  })