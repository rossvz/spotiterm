import SpotifyWebApi from 'spotify-web-api-node'
import { path } from 'ramda'
import opn from 'opn'
import { startServerAndListenForCode } from './server'
import { getCache, memoryCache, oneYear } from './cache'
import { getCredentials } from './TokenApi'

const scopes = [
  'user-read-playback-state',
  'user-read-currently-playing',
  'user-read-private',
  'user-read-email',
  'user-modify-playback-state'
]

export class SpotifyApi {
  access_token: string | null = null
  clientId = '6bd46d7ca9d441f59b7ff6fee000b814'
  redirectUri = 'http://localhost:3000/callback'
  spotifyApi: any
  currentInfo: any
  constructor() {
    getCache().then(async () => {
      const SECRET = await getCredentials()
      this.spotifyApi = new SpotifyWebApi({
        clientId: this.clientId,
        redirectUri: this.redirectUri,
        clientSecret: SECRET
      })
      this.attemptSetAccessToken()
    })
  }

  async attemptSetAccessToken() {
    memoryCache.get('access_token', (err, data) => {
      if (data) {
        this.access_token = data
        return this.spotifyApi.setAccessToken(data)
      }
      this.refreshToken()
    })
  }

  async refreshToken() {
    memoryCache.get('refresh_token', async (err, data) => {
      if (data) {
        try {
          this.spotifyApi.setRefreshToken(data)
          const { body } = await this.spotifyApi.refreshAccessToken()
          this.access_token = body.access_token
          return this.spotifyApi.setAccessToken(body.access_token)
        } catch (e) {
          return this.login()
        }
      } else {
        this.login()
      }
    })
  }

  login() {
    startServerAndListenForCode(async code => {
      try {
        const data = await this.spotifyApi.authorizationCodeGrant(code)
        const { access_token, expires_in, refresh_token } = data.body
        memoryCache.set('access_token', access_token, { ttl: expires_in })
        memoryCache.set('refresh_token', refresh_token, {
          ttl: oneYear()
        })
        this.access_token = access_token
        this.spotifyApi.setAccessToken(access_token)
        this.spotifyApi.setRefreshToken(access_token)
      } catch (e) {
        console.error(e)
        memoryCache.del('refresh_token')
      }
    })
    opn(this.spotifyApi.createAuthorizeURL(scopes))
  }

  async getCurrentInfo(isRetry = false) {
    try {
      const info = await this.spotifyApi.getMyCurrentPlaybackState({})
      const newInfo = {
        isPlaying: path(['body', 'is_playing'], info),
        image: path(['body', 'item', 'album', 'images', '0', 'url'], info),
        album: path(['body', 'item', 'album', 'name'], info),
        artist: path(['body', 'item', 'artists', '0', 'name'], info),
        track: path(['body', 'item', 'name'], info)
      }
      if (this.currentInfo === newInfo) return null
      this.currentInfo = newInfo
      return this.currentInfo
    } catch (e) {
      if (e.statusCode && e.statusCode === 401) {
        this.access_token = null
        await this.attemptSetAccessToken()
        if (!isRetry) return this.getCurrentInfo(true)
      }
    }
  }
}
