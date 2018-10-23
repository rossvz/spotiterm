#!/usr/bin/env node
import { onAuth } from './auth-html-strings'

require('dotenv').config()
import express from 'express'
import clear from 'clear'
import { SpotifyApi } from './SpotifyApi'
import got from 'got'
import { printToConsole } from './output'
import qs from 'qs'
import bodyParser from 'body-parser'
import update from './update'
let server = null
update()
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

const s = new SpotifyApi()

const updateImage = () => {
  if (!s.access_token) return
  s.getCurrentInfo().then(async data => {
    if (data) {
      clear()
      const body = data.image
        ? (await got(data.image, { encoding: null })).body
        : null
      await printToConsole(data, body)
    }
  })
}

setInterval(updateImage, 50)
