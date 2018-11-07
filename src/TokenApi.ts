import axios from 'axios'
import { getCache, oneYear } from './cache'
const BASE_URL = 'https://guarded-badlands-11018.herokuapp.com'
import prompt from 'prompt-async'

export const getCredentials = async () =>
  new Promise(async (resolve, reject) => {
    try {
      const memory = await getCache()
      memory.get('spotiterm_secret', async (err, data) => {
        if (data) resolve(data)
        else {
          const email = await promptEmail()
          const { data: secret } = await axios.get(
            `${BASE_URL}/credentials?client=6bd46d7ca9d441f59b7ff6fee000b814&email=${email}`
          )
          memory.set('spotiterm_secret', secret, { ttl: oneYear() })
          resolve(secret)
        }
      })
    } catch (e) {
      reject(e)
    }
  })

const promptEmail = async () => {
  prompt.message = `Welcome to Spotiterm!`
  prompt.delimiter = `\n`
  prompt.start()
  const { email } = await prompt.get({
    properties: {
      email: {
        description: `What's your email address?`
      }
    }
  })
  return email
}
