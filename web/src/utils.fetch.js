if (process.env.NODE_ENV === 'development') {
  var ipApi = 'http://localhost'
  var ipOss = 'http://localhost'
  var ipOnnx = 'http://localhost'
  var ipWasm = 'http://localhost'

  ipApi = 'http://124.156.103.235'
  ipOss = 'http://124.156.103.235'
}

if (process.env.NODE_ENV === 'production') {
  var ipApi = window.location.origin
  var ipOss = window.location.origin
  var ipOnnx = window.location.origin
  var ipWasm = window.location.origin
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

export { ipApi, ipOss, ipOnnx, ipWasm, urlDecode, Fetch }
