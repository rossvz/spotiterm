import { config } from 'dotenv'

config()

import express from 'express'
import clear from 'clear'
import terminalImage from 'terminal-image'
import { SpotifyApi } from './SpotifyApi'
import got from 'got'

export const startServerAndListenForCode = cb => {
  let server
  const app = express()

  app.get('/callback', async (req, res) => {
    res.send(`
    <script>window.close()</script>
    `)
    server.close()
    cb(req.query.code)
  })

  server = app.listen(3000)
}

const s = new SpotifyApi()

const updateImage = () => {
  s.getCurrentInfo().then(async data => {
    if (data) {
      clear()
      const { body } = await got(data.image, { encoding: null })
      console.log(`
      Track: ${data.track}
      Artist: ${data.artist}
      Album: ${data.album}
      `)
      console.log(await terminalImage.buffer(body))
    }
  })
}

setInterval(updateImage, 1000)
