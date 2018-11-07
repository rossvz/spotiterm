import terminalImage from 'terminal-image'
import center from 'center-align'
import termSize from 'term-size'
import clear from 'clear'
import figlet from 'figlet'
const isITerm = () => process.env.TERM_PROGRAM === 'iTerm.app'

const emptyLine = () => new Array(termSize().columns).fill(' ').join('')
const pad = new Array(Math.round(termSize().columns / 4) + 2).fill(' ').join('')

const maybeCenter = (str, col) => (isITerm() ? center(str, col) : str)
const maybePad = image => (isITerm() ? `${pad}${image}` : image)
export async function printToConsole(data, body: any) {
  clear()
  const term = termSize()
  const image = body
    ? await terminalImage(body, { width: term.columns / 2 - 4 })
    : ''
  console.log(maybeCenter(`Track: ${data.track}`, term.columns))
  console.log(maybeCenter(`Artist: ${data.artist}`, term.columns))
  console.log(maybeCenter(`Album: ${data.album}`, term.columns))
  console.log(maybePad(image))
}

export const printPendingMessage = () => {
  clear()
  figlet.text(
    'Spotiterm',
    {
      font: 'Slant'
    },
    (err, data) => {
      if (err) {
        return
      }
      console.log(data)
      console.log(`\n -- Paused --`)
    }
  )
}
