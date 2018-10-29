import cacheManager from 'cache-manager'
import fsStore from 'cache-manager-fs'
import home from 'user-home'
import path from 'path'
import moment from 'moment'

export let memoryCache = null

export const getCache = async () => memoryCache || (await initCache())

export const initCache = () =>
  new Promise(
    (resolve, reject) =>
      (memoryCache = cacheManager.caching({
        store: fsStore,
        path: path.resolve(home, '.spotiterm/'),
        preventfill: false,
        reviveBuffers: false,
        fillcallback: data => {
          resolve(memoryCache)
        }
      }))
  )

export const oneYear = () =>
  moment()
    .add(1, 'year')
    .unix()
