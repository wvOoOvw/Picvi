const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const fetch = require('node-fetch')
const FormData = require('form-data')

const { authorization } = require('../../../common/authorization')

const API = 'http://localhost'

const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const upload = async (props) => {
  const authorization = props.authorization
  const filePath = props.filePath
  const originName = props.originName
  const _id = props._id

  let ext = path.extname(originName).replace('.', '').toLowerCase()
  if (ext === 'jpeg') ext = 'jpg'

  const filename = `${md5(originName)}.${ext}.enc`

  const formData = new FormData()
  formData.append('file', fs.createReadStream(filePath), { filename })
  formData.append('dir', `/cartoon/${_id}/${filename}`)

  const res = await fetch(`${API}/api/app/upload`, {
    method: 'post',
    body: formData,
    headers: { 'Authorization': authorization }
  }).then(res => res.json())

  if (res.code !== 200) throw res

  return 'kapi://remote.oss' + res.data
}

const _run = async () => {
  const target_path = path.resolve(__dirname, './build')

  const dirs = fs.readdirSync(target_path).filter(i => !i.includes('.DS_Store'))

  for (const dir of dirs) {
    const files = fs.readdirSync(path.resolve(target_path, dir)).filter(i => !i.includes('.DS_Store'))

    let name = JSON.parse(fs.readFileSync(path.resolve(target_path, dir, '_.json'), 'utf-8').replace(/^\uFEFF/, '')).name
    let description = ''

    {
      let P = 0
      let V = 0

      files.filter(i => i !== '_.json').forEach(i => {
        if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff)(\.enc)?$/i.test(i)) P += 1
        if (/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v)(\.enc)?$/i.test(i)) V += 1
      })

      if (P > 0) description = `包含内容：${P}P`
      if (V > 0) description = `包含内容：${V}V`
      if (P > 0 && V > 0) description = `包含内容：${P}P+${V}V`
    }

    const exist = await fetch(`${API}/api/app/cartoon/find/list`, {
      method: 'post',
      body: JSON.stringify({
        filter: { name: name },
        seed: 1,
        skip: 0,
        limit: 100
      }),
      headers: { 'Authorization': authorization, 'Content-Type': 'application/json' }
    }).then(res => res.json())

    if (exist.data && exist.data.some(i => i.name === name)) continue

    const created = await fetch(`${API}/api/app/admin/cartoon/insert`, {
      method: 'post',
      body: JSON.stringify({
        name: name,
        description: description,
        tag: [],
        actor: [],
        poster: [],
        preview: [],
        subscribeview: [],
        status: 0
      }),
      headers: { 'Authorization': authorization, 'Content-Type': 'application/json' }
    }).then(res => res.json())

    const _id = String(created.data.insertedId)

    console.log('insert', _id)

    fs.renameSync(path.resolve(target_path, dir), path.resolve(target_path, _id))

    const subscribeview = []

    for (const file of files.filter(i => i.endsWith('.enc'))) {
      const link = await upload({
        authorization: authorization,
        filePath: path.resolve(target_path, _id, file),
        originName: file.replace(/\.enc$/i, ''),
        _id: _id
      })

      subscribeview.push(link)

      console.log('upload', file, link)
    }

    await fetch(`${API}/api/app/admin/cartoon/update`, {
      method: 'post',
      body: JSON.stringify({
        cartoon_id: _id,
        name: name,
        description: description,
        tag: [],
        actor: [],
        poster: [subscribeview[0]],
        preview: [subscribeview[0], subscribeview[1], subscribeview[2]],
        subscribeview: subscribeview,
        status: 0
      }),
      headers: { 'Authorization': authorization, 'Content-Type': 'application/json' }
    }).catch(e => console.log(e))

    console.log('subscribeview', _id, subscribeview.length)

    {
      const jsonPath = path.resolve(__dirname, './src', name, '_.json')
      const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf-8').replace(/^﻿/, ''))
      meta._id = _id
      fs.writeFileSync(jsonPath, JSON.stringify(meta, null, 2))
    }
  }
}

_run()
