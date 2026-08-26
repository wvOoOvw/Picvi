export function isWeChatBrowser() {
  const ua = navigator.userAgent.toLowerCase()
  return ua.indexOf('micromessenger') !== -1
}

export function isQQBrowser() {
  const ua = navigator.userAgent.toLowerCase()
  return ua.indexOf('qqbrowser') !== -1 || ua.indexOf('mqqbrowser') !== -1
}

export function shouldOpenInExternalBrowser() {
  return isWeChatBrowser() || isQQBrowser()
}