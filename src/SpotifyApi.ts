import SpotifyWebApi from 'spotify-web-api-node'
import { path } from 'ramda'
import opn from 'opn'
import { startServerAndListenForCode } from './app'

import cacheManager from 'cache-manager'
import fsStore from 'cache-manager-fs'

let memoryCache = null
const SPOTIFY_SECRET = process.env.SPOTIFY_SECRET
const initCache = () =>
  new Promise((resolve, reject) => {
    memoryCache = cacheManager.caching({
      store: fsStore,
      path: 'cache',
      ttl: 12 * 60 * 60,
      preventfill: false,
      reviveBuffers: false,
      fillcallback: data => {
        resolve()
      }
    })
  })

const scopes = ['user-read-playback-state', 'streaming']

export class SpotifyApi {
  clientSecret = SPOTIFY_SECRET
  clientId = '4ad79359f396409eb2366ffadb10fe8b'
  redirectUri = 'http://localhost:3000/callback'
  spotifyApi: any
  currentInfo: any
  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientSecret: this.clientSecret,
      clientId: this.clientId,
      redirectUri: this.redirectUri
    })
    initCache().then(() => {
      this.attemptSetAccessToken()
    })
  }

  async attemptSetAccessToken() {
    memoryCache.get('access_token', (err, data) => {
      if (data) return this.spotifyApi.setAccessToken(data)
      this.login()
    })
  }

  login() {
    startServerAndListenForCode(async code => {
      const data = await this.spotifyApi.authorizationCodeGrant(code)
      const { access_token, refresh_token, expires_in } = data.body
      memoryCache.set('access_token', access_token, { ttl: expires_in })
      memoryCache.set('refresh_token', refresh_token)
      this.spotifyApi.setRefreshToken(refresh_token)
      this.spotifyApi.setAccessToken(access_token)
    })
    this.generateAuthUrl()
  }

  generateAuthUrl() {
    const url = this.spotifyApi.createAuthorizeURL(scopes)
    opn(url)
  }

  async getCurrentInfo(isRetry = false) {
    try {
      const info = await this.spotifyApi.getMyCurrentPlaybackState()
      const newInfo = {
        image: path(['body', 'item', 'album', 'images', '0', 'url'], info),
        album: path(['body', 'item', 'album', 'name'], info),
        artist: path(['body', 'item', 'artists', '0', 'name'], info),
        track: path(['body', 'item', 'name'], info)
      }
      if (this.currentInfo) {
        if (newInfo.track === this.currentInfo.track) return null
      }
      this.currentInfo = newInfo
      return this.currentInfo
    } catch (e) {
      if (e.statusCode && e.statusCode === 401) {
        await this.attemptSetAccessToken()
        if (!isRetry) return this.getCurrentInfo(true)
      }
    }
  }
}
