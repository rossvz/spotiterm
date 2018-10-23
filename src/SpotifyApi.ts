import SpotifyWebApi from 'spotify-web-api-node'
import { path } from 'ramda'
import opn from 'opn'
import { startServerAndListenForCode } from './app'

import cacheManager from 'cache-manager'
import fsStore from 'cache-manager-fs'
import qs from 'qs'
import { ImplicitAuthResults } from './types'
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

const scopes = [
  'user-read-playback-state',
  'user-read-currently-playing',
  'user-read-private',
  'user-read-email',
  'user-modify-playback-state'
]

export class SpotifyApi {
  clientSecret = SPOTIFY_SECRET
  clientId = '4ad79359f396409eb2366ffadb10fe8b'
  redirectUri = 'http://localhost:3000/callback'
  spotifyApi: any
  currentInfo: any

  constructor() {
    this.spotifyApi = new SpotifyWebApi({
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

  implicitGrant() {
    const baseUrl = `https://accounts.spotify.com/authorize?`
    const params = qs.stringify({
      client_id: this.clientId,
      response_type: 'token',
      redirect_uri: this.redirectUri,
      scope: scopes
    })
    const url = `${baseUrl}${params}`
    opn(url)
  }

  login() {
    startServerAndListenForCode(async (results: ImplicitAuthResults) => {
      try {
        const { access_token, expires_in } = results
        memoryCache.set('access_token', access_token, { ttl: expires_in })
        this.spotifyApi.setAccessToken(access_token)
      } catch (e) {
        console.error(e)
      }
    })
    this.implicitGrant()
  }

  async getCurrentInfo(isRetry = false) {
    try {
      const info = await this.spotifyApi.getMyCurrentPlaybackState({})
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
        console.error(401)
        await this.attemptSetAccessToken()
        if (!isRetry) return this.getCurrentInfo(true)
      }
    }
  }
}
