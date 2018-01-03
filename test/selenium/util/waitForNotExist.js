/* global browser */

export default function waitForNotExist(...args): Promise<void> {
  return browser.waitForExist(...args, true)
}

