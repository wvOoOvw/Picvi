const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const fetch = require('node-fetch')
const FormData = require('form-data')

const { authorization } = require('../../../common/authorization')

const { extensionIsImage, extensionIsVideo } = require('../../../common/extension')

// const API = 'http://localhost'
const API = 'http://124.156.103.235'

const md5File = filepath => crypto.createHash('md5').update(fs.readFileSync(filepath)).digest('hex')

const upload = async (props) => {
  const uploadpath = props.uploadpath
  const uploadname = props.uploadname
  const _id = props._id

  const ext = path.extname(uploadname.replace(/\.enc$/i, '')).replace('.', '').toLowerCase()

  const filename = `${md5File(uploadpath)}.${ext}.enc`
  const filepath = `/cartoon/${_id}/${filename}`

  const formData = new FormData()
  formData.append('file', fs.createReadStream(uploadpath))
  formData.append('filepath', filepath)

  const res = await fetch(`${API}/api/app/upload`, {
    method: 'post',
    body: formData,
    headers: { 'Authorization': authorization }
  }).then(res => res.json())

  if (res.code !== 200) throw res

  return 'kapi://remote.oss' + filepath
}

const _run = async () => {
  const target_path = path.resolve(__dirname, './build')

  const dirs = fs.readdirSync(target_path).filter(i => !i.includes('.DS_Store'))

  for (const dir of dirs) {
    const files = fs.readdirSync(path.resolve(target_path, dir)).filter(i => !i.includes('.DS_Store'))

    const name = dir
    const description = `包含内容：${files.filter(i => extensionIsImage(i)).length}P + ${files.filter(i => extensionIsVideo(i)).length}V`

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
        name: '',
        description: '',
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

    const subscribeview = []

    for (const file of files.filter(i => i.endsWith('.enc'))) {
      const link = await upload({
        uploadpath: path.resolve(target_path, dir, file),
        uploadname: file,
        _id: _id
      })

      subscribeview.push(link)

      console.log('upload', file, link)
    }

    const subscribeviewImage = subscribeview.filter(i => extensionIsImage(i))
    const subscribeviewVideo = subscribeview.filter(i => extensionIsVideo(i))

    await fetch(`${API}/api/app/admin/cartoon/update`, {
      method: 'post',
      body: JSON.stringify({
        cartoon_id: _id,
        name: name,
        description: description,
        tag: ['日漫'],
        actor: [],
        poster: [subscribeviewImage[0]].filter(i => i !== undefined),
        preview: [subscribeviewImage[0], subscribeviewImage[1], subscribeviewImage[2]].filter(i => i !== undefined),
        subscribeview: [...subscribeviewImage, ...subscribeviewVideo],
        status: 1
      }),
      headers: { 'Authorization': authorization, 'Content-Type': 'application/json' }
    }).catch(e => console.log(e))

    console.log('subscribeview', _id, subscribeview.length)
  }
}

_run()
