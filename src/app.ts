#!/usr/bin/env node
import checkUpdate from './update'
import { updateImage } from './updateImage'

checkUpdate().then(hasUpdate => {
  if (hasUpdate) return
  setInterval(updateImage, 50)
})
