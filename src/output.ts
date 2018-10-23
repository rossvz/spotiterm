import terminalImage from 'terminal-image'
import center from 'center-align'
import termSize from 'term-size'

export async function printToConsole(data, body: any) {
  const term = termSize()
  const image = body ? await terminalImage(body, { height: term.rows - 5 }) : ''
  console.log(center(`Track: ${data.track}`, term.columns))
  console.log(center(`Artist: ${data.artist}`, term.columns))
  console.log(center(`Album: ${data.album}`, term.columns))
  console.log(center(image, term.columns))
}
