const pkg = require('../package')
const checkForUpdate = require('update-check')

let update = null

export default async () => {
  try {
    update = await checkForUpdate(pkg)
  } catch (err) {
    console.error(`Failed to check for updates: ${err}`)
  }

  if (update) {
    console.log(`
    The latest version is ${update.latest}. 
    Please update by running:
    npm install -g spotiterm`)
  }
}
