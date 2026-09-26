const fetch = require('node-fetch')

const { authorization } = require('../../../common/authorization')
const { API } = require('../../../common/host.js')

const { ObjectId, Mongo, Collection } = require('../../src/utils.mongo')

const _id = ''

const deletepath = _id ? `/cartoon/${_id}` : '/cartoon'

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
  await Mongo.client.db(Collection).collection('Cartoon').deleteMany(_id ? { _id: new ObjectId(_id) } : { })

  console.log('deleteMongo')
  
  await Mongo.close()
}

deleteMongo()
deleteFolder()