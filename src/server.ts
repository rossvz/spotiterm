import express from 'express'
import bodyParser from 'body-parser'
import qs from 'qs'

let server = null
export const startServerAndListenForCode = cb => {
  const app = express()
  app.use(bodyParser.json())

  app.get('/callback', async (req, res) => {
    res.send(`
    <script>window.close()</script>
    `)
    if (server) server.close()
    server = null
    cb(req.query.code)
  })

  app.post('/token', (req, res) => {
    res.end()
    cb(qs.parse(req.body.token))
    if (server) server.close()
    server = null
  })

  if (!server) server = app.listen(3000)
}
