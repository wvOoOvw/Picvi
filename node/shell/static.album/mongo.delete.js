const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const fetch = require('node-fetch')
const FormData = require('form-data')

const { authorization } = require('../../../common/authorization')
const { extensionIsImage, extensionIsVideo } = require('../../../common/extension')
const { ObjectId, Mongo, Collection } = require('../../src/utils.mongo')
const { API } = require('../../../common/host.js')

const _id = ''

const deletepath = _id ? `/album/${_id}` : '/album'

const deleteFolder = async () => {
  const res = await fetch(`${API}/api/app/upload/delete`, {
    method: 'post',
    body: JSON.stringify({ filepath: deletepath }),
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())

  console.log('deleteFolder')

  if (res.code !== 200) throw res

  return true
}

const deleteMongo = async () => {
  await Mongo.client.db(Collection).collection('Album').deleteMany(_id ? { _id: new ObjectId(_id) } : { })

  console.log('deleteMongo')
  
  await Mongo.close()
}

deleteMongo()
deleteFolder()