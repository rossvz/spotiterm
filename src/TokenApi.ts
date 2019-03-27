import axios from 'axios'
import os from 'os'
import { machineId } from 'node-machine-id'
import { getCache, oneYear } from './cache'
import Cryptr from 'cryptr'
const BASE_URL = 'https://spotiterm-token-server.herokuapp.com'

export const getCredentials = async () =>
  new Promise(async (resolve, reject) => {
    try {
      const memory = await getCache()
      memory.get('spotiterm_secret', async (err, data) => {
        if (data) resolve(data)
        else {
          const { username, id } = await getUser()
          const { data: response } = await axios.post(`${BASE_URL}/login`, {
            username,
            machineId: id
          })
          const secret = new Cryptr(id).decrypt(response.meta)
          memory.set('spotiterm_secret', secret, { ttl: oneYear() })
          resolve(secret)
        }
      })
    } catch (e) {
      reject(e)
    }
  })

const getUser = async () => {
  const { username } = os.userInfo()
  const id = await machineId()
  return { username, id }
}
