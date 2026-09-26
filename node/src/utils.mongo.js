const { MongoClient, ObjectId } = require('mongodb')

function MongoConstructor(url) {
  this.url = url
  this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true })
  this.connect(url)
}

MongoConstructor.prototype.connect = async function () {
  this.client.connect()
    .then(err => {
      console.log(`mongo connected - ${this.url}`)
    })
}

MongoConstructor.prototype.close = function () {
  this.client.close()
}

const user = 'root'
const password = 'NDoNwwt1uaLESBcr'

const url = `mongodb://${user}:${password}@ac-uvq5uha-shard-00-00.akp7itc.mongodb.net:27017,ac-uvq5uha-shard-00-01.akp7itc.mongodb.net:27017,ac-uvq5uha-shard-00-02.akp7itc.mongodb.net:27017/?ssl=true&replicaSet=atlas-kc64he-shard-0&authSource=admin&appName=ClusterA`

const Mongo = new MongoConstructor(url)

const Collection = 'MediaDB'

module.exports = { ObjectId, Mongo, Collection }