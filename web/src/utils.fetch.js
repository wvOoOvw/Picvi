var ipApi = 'http://124.156.103.235'
var ipOss = 'http://124.156.103.235'

// ipApi = window.location.origin
// ipOss = window.location.origin
// ipApi = 'http://localhost'
// ipOss = 'http://localhost'

if (process.env.NODE_ENV === 'prod') {
  ipApi = window.location.origin
  ipOss = window.location.origin
}

const urlDecode = (url) => {
  if (typeof url === 'string') {
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('kapi://remote.oss')) return url.replace('kapi://remote.oss', ipOss)

    return ipApi + url
  }

  return url
}

function FetchConstructor() {
  this.authorization = ''
}

FetchConstructor.prototype.connect = async function (authorization) {
  this.authorization = authorization
}

FetchConstructor.prototype.json = async function (url, body, signal) {
  return window.fetch
    (
      urlDecode(url),
      {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Authorization': this.authorization, 'Content-Type': 'application/json' },
        signal: signal
      }
    )
    .then(res => {
      return res.json()
    })
    .then(res => {
      if (res.code === 200) return res
      if (res.code !== 200) throw res
    })
}

FetchConstructor.prototype.form = async function (url, body, signal) {
  return window.fetch
    (
      urlDecode(url),
      {
        method: 'post',
        body: body,
        headers: { 'Authorization': this.authorization },
        signal: signal
      }
    )
    .then(res => {
      return res.json()
    })
    .then(res => {
      if (res.code === 200) return res
      if (res.code !== 200) throw res
    })
}

FetchConstructor.prototype.arrayBufferUnauth = async function (url, signal) {
  return window.fetch
    (
      urlDecode(url),
      {
        method: 'get',
        signal: signal
      }
    )
    .then(res => {
      return res.arrayBuffer()
    })
}

const Fetch = new FetchConstructor()

export { ipApi, ipOss, urlDecode, Fetch }
