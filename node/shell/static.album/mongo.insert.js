const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const fetch = require('node-fetch')
const FormData = require('form-data')

const { extensionIsImage, extensionIsVideo } = require('../../../common/extension')
const { authorization } = require('../../../common/authorization')
const { API } = require('../../../common/host.js')

const { ObjectId, Mongo, Collection } = require('../../src/utils.mongo')

const target_path = path.resolve(__dirname, './._build')

const md5File = filepath => crypto.createHash('md5').update(fs.readFileSync(filepath)).digest('hex')

const upload = async (props) => {
  const uploadpath = props.uploadpath
  const uploadname = props.uploadname
  const _id = props._id

  const ext = path.extname(uploadname.replace(/\.enc$/i, '')).replace('.', '').toLowerCase()

  const filename = `${md5File(uploadpath)}.${ext}.enc`
  const filepath = `/album/${_id}/${filename}`

  const formData = new FormData()
  formData.append('file', fs.createReadStream(uploadpath))
  formData.append('filepath', filepath)

  const res = await fetch(`${API}/api/app/upload`, {
    method: 'post',
    body: formData,
    headers: { 'Authorization': authorization }
  }).then(res => res.json())

  if (res.code !== 200) throw res

  return 'remote://remote.oss' + filepath
}

const _run = async () => {
  const dirs = fs.readdirSync(target_path).filter(i => !i.includes('.DS_Store'))

  // 前置查询所有已存在的name
  const existingAlbums = await Mongo.client.db(Collection).collection('Album').find({}, { projection: { name: 1 } }).toArray()
  const existingNames = existingAlbums.map(doc => doc.name)

  for (const dir of dirs) {
    const files = fs.readdirSync(path.resolve(target_path, dir)).filter(i => !i.includes('.DS_Store'))

    const name = dir.replace('【', '').replace('】', '').replace(/NO\.\d+/i, '').replace('  ', ' ')
    const description = `包含内容：${files.filter(i => extensionIsImage(i)).length}P + ${files.filter(i => extensionIsVideo(i)).length}V`
    const actor = dir.match(/【.+】/)[0].replace('【', '').replace('】', '')

    if (existingNames.includes(name)) {
      console.log('exist', name)
      continue
    }

    const created = await Mongo.client.db(Collection).collection('Album').insertOne({
      name: '',
      description: '',
      tag: [],
      actor: [],
      poster: [],
      preview: [],
      subscribeview: [],
      status: 0,
      createTime: new Date().getTime(),
      updateTime: new Date().getTime()
    })

    const _id = String(created.insertedId)

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

    await Mongo.client.db(Collection).collection('Album').updateOne({ _id: new ObjectId(_id) }, {
      $set: {
        name: name,
        description: description,
        tag: ['COSPLAy'],
        actor: [actor],
        poster: [subscribeviewImage[0]].filter(i => i !== undefined),
        preview: [subscribeviewImage[0], subscribeviewImage[1], subscribeviewImage[2]].filter(i => i !== undefined),
        subscribeview: [...subscribeviewImage, ...subscribeviewVideo],
        status: 1,
        updateTime: new Date().getTime()
      }
    })

    console.log('subscribeview', _id, subscribeview.length)
  }

  await Mongo.close()
}

_run()
