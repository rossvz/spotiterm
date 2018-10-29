import { printPendingMessage, printToConsole } from './output'
import got from 'got'
import { SpotifyApi } from './SpotifyApi'

const s = new SpotifyApi()

export const updateImage = async () => {
  if (!s.access_token) return
  const data = await s.getCurrentInfo()
  if (data) {
    if (!data.isPlaying) await printPendingMessage()
    else {
      const body = data.image
        ? (await got(data.image, { encoding: null })).body
        : null
      await printToConsole(data, body)
    }
  }
}
