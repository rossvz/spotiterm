import { onAuth } from './auth-html-strings'
import express from 'express'
import bodyParser from 'body-parser'
import qs from 'qs'

let server = null
export const startServerAndListenForCode = cb => {
  const app = express()
  app.use(bodyParser.json())

  app.get('/callback', async (req, res) => {
    res.send(onAuth)
  })

  app.post('/token', (req, res) => {
    res.end()
    cb(qs.parse(req.body.token))
    server.close()
    server = null
  })

  if (!server) server = app.listen(3000)
}
