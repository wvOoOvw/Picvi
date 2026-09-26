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

  return 'remote://remote.oss' + filepath
}

const deleteFolder = async (filepath) => {
  const res = await fetch(`${API}/api/app/upload/delete`, {
    method: 'post',
    body: JSON.stringify({ filepath }),
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())

  if (res.code !== 200) throw res

  return true
}

const _run = async () => {
  const dirs = fs.readdirSync(target_path).filter(i => !i.includes('.DS_Store'))

  for (const dir of dirs) {
    const files = fs.readdirSync(path.resolve(target_path, dir)).filter(i => !i.includes('.DS_Store'))

    const name = dir.replace('【', '').replace('】', '').replace('NO\.\d+/', '').replace('  ', ' ')

    // 查找对应的漫画记录
    const cartoon = await Mongo.client.db(Collection).collection('Cartoon').findOne({ name: name })

    if (!cartoon) {
      console.log('cartoon not found, skip', name)
      continue
    }

    const _id = String(cartoon._id)

    console.log('process cartoon', _id, name)

    // 删除远程文件夹
    const remoteFolder = `/cartoon/${_id}`
    try {
      await deleteFolder(remoteFolder)
      console.log('deleted remote folder', remoteFolder)
    } catch (e) {
      console.error('delete folder error', e.message)
      continue
    }

    const subscribeview = []

    // 上传文件
    for (const file of files.filter(i => i.endsWith('.enc'))) {
      try {
        const link = await upload({
          uploadpath: path.resolve(target_path, dir, file),
          uploadname: file,
          _id: _id
        })

        subscribeview.push(link)

        console.log('upload', file, link)
      } catch (e) {
        console.error('upload error', file, e.message)
      }
    }

    const subscribeviewImage = subscribeview.filter(i => extensionIsImage(i))
    const subscribeviewVideo = subscribeview.filter(i => extensionIsVideo(i))

    // 更新字段
    await Mongo.client.db(Collection).collection('Cartoon').updateOne({ _id: new ObjectId(_id) }, {
      $set: {
        poster: [subscribeviewImage[0]].filter(i => i !== undefined),
        preview: [subscribeviewImage[0], subscribeviewImage[1], subscribeviewImage[2]].filter(i => i !== undefined),
        subscribeview: [...subscribeviewImage, ...subscribeviewVideo],
        updateTime: new Date().getTime()
      }
    })

    console.log('update cartoon', _id, 'subscribeview:', subscribeview.length, 'poster:', subscribeviewImage.length > 0 ? 1 : 0, 'preview:', subscribeviewImage.slice(0, 3).length)
  }

  await Mongo.close()
}

_run()
