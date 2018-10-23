import { printToConsole } from './output'
import got from 'got'
import { SpotifyApi } from './SpotifyApi'

const s = new SpotifyApi()

export const updateImage = () => {
  if (!s.access_token) return
  s.getCurrentInfo().then(async data => {
    if (data) {
      const body = data.image
        ? (await got(data.image, { encoding: null })).body
        : null
      await printToConsole(data, body)
    }
  })
}
