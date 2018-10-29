#!/usr/bin/env node
import checkUpdate from './update'
import { updateImage } from './updateImage'
checkUpdate().then(async hasUpdate => {
  if (hasUpdate) return
  setTimeout(updateImage, 1000)
  setInterval(updateImage, 3000)
})
