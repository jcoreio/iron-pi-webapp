/* global browser */

export default async function getText(selector: string): Promise<string | Array<string>> {
  const {value: elements} = await browser.elements(selector)
  if (elements.length === 1) return (await browser.elementIdText(elements[0].ELEMENT)).value
  const text = []
  for (let i = 0; i < elements.length; i++) {
    text.push((await browser.elementIdText(elements[i].ELEMENT)).value)
  }
  return text
}

