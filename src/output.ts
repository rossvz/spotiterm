import terminalImage from 'terminal-image'
import center from 'center-align'
import termSize from 'term-size'
import clear from 'clear'

const emptyLine = () => new Array(termSize().columns).fill(' ').join('')

export async function printToConsole(data, body: any) {
  clear()
  const term = termSize()
  const image = body
    ? await terminalImage(body, { width: term.columns / 2 })
    : ''
  const pad = new Array(Math.round(term.columns / 4)).fill(' ').join('')
  console.log(emptyLine())
  console.log(center(`Track: ${data.track}`, term.columns))
  console.log(center(`Artist: ${data.artist}`, term.columns))
  console.log(center(`Album: ${data.album}`, term.columns))
  console.log(emptyLine())
  console.log(`${pad}${image}`)
}
