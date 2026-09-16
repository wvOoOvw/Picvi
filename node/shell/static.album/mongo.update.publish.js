const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const { Mongo, Collection } = require('../../src/utils.mongo')

Mongo.client.db(Collection).collection('Album').find({}).toArray().then(data => {
  data
    .forEach(i => {
      Mongo.client.db(Collection).collection('Album').updateOne({ _id: i._id }, { '$set': { status: 1 } }).then(res => console.log('updateOne', i._id))
    })
})