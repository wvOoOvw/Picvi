const crypto = require('crypto')
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const FormData = require('form-data')

const router = require('express').Router()

const { ObjectId, Mongo, Collection } = require('./utils.mongo')

router.use('/api/app', async (req, res, next) => {

  try {
    if (JSON.stringify(req.body).includes('$')) {
      throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    next()
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

/* User API START */

router.post('/api/app/user/find/login/credential', async (req, res) => {
  const { credential, password } = req.body

  try {
    {
      if (typeof credential !== 'string') {
        throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      }
      if (typeof password !== 'string') {
        throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      }
    }

    const user = await Mongo.client.db(Collection).collection('User').findOne({ credential, password }, { projection: { _id: 1, authorization: 1, subscription: 1, subscriptionExpireTime: 1 } })

    if (user !== null) res.send({ code: 200, data: user })
    if (user === null) throw { error: new Error(), data: { code: 500, message: '登录失败' } }
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/user/find/login/authorization', async (req, res) => {
  const { authorization } = req.headers

  try {
    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const user = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, authorization: 1, subscription: 1, subscriptionExpireTime: 1 } })

    if (user !== null) res.send({ code: 200, data: user })
    if (user === null) res.send({ code: 500 })

  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/user/find/self', async (req, res) => {
  const { authorization } = req.headers

  try {
    {
      if (typeof authorization !== 'string' && typeof authorization !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const user = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization })

    res.send({ code: 200, data: user })

  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/user/insert', async (req, res) => {
  const { credential, password } = req.body

  try {
    {
      if (typeof credential !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof password !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (credential.length > 32 || credential.length < 8 || credential.match(/^[a-zA-Z0-9\.\@\#\%\^\&\*]+$/) === null) throw { error: new Error(), data: { code: 500, message: '账号必须由8-32位字母数字组成' } }
      if (password.length > 32 || password.length < 8 || password.match(/^[a-zA-Z0-9\.\@\#\%\^\&\*]+$/) === null) throw { error: new Error(), data: { code: 500, message: '账号必须由8-32位字母数字组成' } }

      const credentialRepeat = await Mongo.client.db(Collection).collection('User').findOne({ credential }, { projection: { _id: 1 } })

      if (credentialRepeat) throw { error: new Error(), data: { code: 500, message: '注册失败，账号重复' } }
    }

    const authorization = crypto.createHash('md5').update(credential + '_' + password).digest('hex')

    await Mongo.client.db(Collection).collection('User').insertOne({ credential, password, authorization, subscription: 'user', subscriptionExpireTime: 0, albumFavoriteds_id: [], cartoonFavoriteds_id: [], videoFavoriteds_id: [] })

    const user = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, authorization: 1, subscription: 1, subscriptionExpireTime: 1 } })

    res.send({ code: 200, data: user })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/user/update', async (req, res) => {
  const { authorization } = req.headers
  const { password } = req.body

  try {
    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof password !== 'string' && typeof password !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      if (password.length > 32 || password.length < 8 || password.match(/^[a-zA-Z0-9\.\@\#\%\^\&\*]+$/) === null) throw { error: new Error(), data: { code: 500, message: '账号必须由8-32位字母数字组成' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, credential: 1 } })

    const authorizationMd5 = crypto.createHash('md5').update(userExist.credential + '_' + password).digest('hex')

    await Mongo.client.db(Collection).collection('User').updateOne({ authorization: authorization }, { $set: { password, authorization: authorizationMd5 } })

    const user = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorizationMd5 }, { projection: { _id: 1, authorization: 1, subscription: 1, subscriptionExpireTime: 1 } })

    res.send({ code: 200, data: user })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/user/update/album/favorite', async (req, res) => {
  const { authorization } = req.headers
  const { album_id, favorite } = req.body

  try {
    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof album_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof favorite !== 'boolean') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, albumFavoriteds_id: 1 } })
      const albumExist = await Mongo.client.db(Collection).collection('Album').findOne({ _id: new ObjectId(album_id) }, { projection: { user_id: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (albumExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (favorite === true && userExist.albumFavoriteds_id.some(i => String(i) === album_id)) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (favorite !== true && userExist.albumFavoriteds_id.every(i => String(i) !== album_id)) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (String(userExist._id) === String(albumExist.user_id)) throw { error: new Error(), data: { code: 500, message: '无法收藏自己的作品' } }
    }

    if (favorite === true) {
      await Mongo.client.db(Collection).collection('User').updateOne({ authorization: authorization }, { $push: { albumFavoriteds_id: new ObjectId(album_id) } })
    }

    if (favorite !== true) {
      await Mongo.client.db(Collection).collection('User').updateOne({ authorization: authorization }, { $pull: { albumFavoriteds_id: new ObjectId(album_id) } })
    }

    res.send({ code: 200 })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/user/update/cartoon/favorite', async (req, res) => {
  const { authorization } = req.headers
  const { cartoon_id, favorite } = req.body

  try {
    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof cartoon_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof favorite !== 'boolean') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, cartoonFavoriteds_id: 1 } })
      const cartoonExist = await Mongo.client.db(Collection).collection('Cartoon').findOne({ _id: new ObjectId(cartoon_id) }, { projection: { user_id: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (cartoonExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (favorite === true && userExist.cartoonFavoriteds_id.some(i => String(i) === cartoon_id)) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (favorite !== true && userExist.cartoonFavoriteds_id.every(i => String(i) !== cartoon_id)) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (String(userExist._id) === String(cartoonExist.user_id)) throw { error: new Error(), data: { code: 500, message: '无法收藏自己的作品' } }
    }

    if (favorite === true) {
      await Mongo.client.db(Collection).collection('User').updateOne({ authorization: authorization }, { $push: { cartoonFavoriteds_id: new ObjectId(cartoon_id) } })
    }

    if (favorite !== true) {
      await Mongo.client.db(Collection).collection('User').updateOne({ authorization: authorization }, { $pull: { cartoonFavoriteds_id: new ObjectId(cartoon_id) } })
    }

    res.send({ code: 200 })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/user/update/video/favorite', async (req, res) => {
  const { authorization } = req.headers
  const { video_id, favorite } = req.body

  try {
    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof video_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof favorite !== 'boolean') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, videoFavoriteds_id: 1 } })
      const videoExist = await Mongo.client.db(Collection).collection('Video').findOne({ _id: new ObjectId(video_id) }, { projection: { user_id: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (videoExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (favorite === true && userExist.videoFavoriteds_id.some(i => String(i) === video_id)) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (favorite !== true && userExist.videoFavoriteds_id.every(i => String(i) !== video_id)) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (String(userExist._id) === String(videoExist.user_id)) throw { error: new Error(), data: { code: 500, message: '无法收藏自己的作品' } }
    }

    if (favorite === true) {
      await Mongo.client.db(Collection).collection('User').updateOne({ authorization: authorization }, { $push: { videoFavoriteds_id: new ObjectId(video_id) } })
    }

    if (favorite !== true) {
      await Mongo.client.db(Collection).collection('User').updateOne({ authorization: authorization }, { $pull: { videoFavoriteds_id: new ObjectId(video_id) } })
    }

    res.send({ code: 200 })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/admin/user/find', async (req, res) => {
  const { authorization } = req.headers
  const { user_id, credential } = req.body

  try {
    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof user_id === 'string' && typeof credential !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof credential === 'string' && typeof user_id !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1 } })

      if (user_id) {
        const user = await Mongo.client.db(Collection).collection('User').findOne({ _id: new ObjectId(user_id) }, { projection: { _id: 1 } })
        if (user === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      }

      if (credential) {
        const user = await Mongo.client.db(Collection).collection('User').findOne({ credential: credential }, { projection: { _id: 1 } })
        if (user === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      }

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (userExist.subscription !== 'administrator') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    var user

    if (user_id) {
      user = await Mongo.client.db(Collection).collection('User').findOne({ _id: new ObjectId(user_id) }, { projection: { _id: 1 } })
    }

    if (credential) {
      user = await Mongo.client.db(Collection).collection('User').findOne({ credential: credential }, { projection: { _id: 1 } })
    }

    res.send({ code: 200, data: user })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/admin/user/update/subscription', async (req, res) => {
  const { authorization } = req.headers
  const { user_id, credential, subscription, subscriptionExpireTimeAddition } = req.body

  try {
    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof user_id === 'string' && typeof credential !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof credential === 'string' && typeof user_id !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof subscription !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof subscriptionExpireTimeAddition !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1 } })

      if (user_id) {
        const user = await Mongo.client.db(Collection).collection('User').findOne({ _id: new ObjectId(user_id) }, { projection: { _id: 1 } })
        if (user === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      }

      if (credential) {
        const user = await Mongo.client.db(Collection).collection('User').findOne({ credential: credential }, { projection: { _id: 1 } })
        if (user === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      }

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (userExist.subscription !== 'administrator') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    if (user_id) {
      await Mongo.client.db(Collection).collection('User').updateOne({ _id: new ObjectId(user_id) }, { $set: { subscription, subscriptionExpireTime: new Date().getTime() + subscriptionExpireTimeAddition } })
    }

    if (credential) {
      await Mongo.client.db(Collection).collection('User').updateOne({ credential: credential }, { $set: { subscription, subscriptionExpireTime: new Date().getTime() + subscriptionExpireTime } })
    }

    res.send({ code: 200 })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

/* User API END */

/* Album API START */

router.post('/api/app/album/find', async (req, res) => {
  const { authorization } = req.headers
  const { album_id } = req.body

  try {
    {
      if (typeof authorization !== 'string' && typeof authorization !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof album_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const albumExist = await Mongo.client.db(Collection).collection('Album').findOne({ _id: new ObjectId(album_id) }, { projection: { _id: 1 } })

      if (albumExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const user = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1, subscriptionExpireTime: 1 } })
    const album = await Mongo.client.db(Collection).collection('Album').findOne({ _id: new ObjectId(album_id) })

    if (user.subscription === 'administrator') {
      res.send({ code: 200, data: album })
    }

    if (user.subscription !== 'administrator') {
      if (!user.subscription.includes('album') || user.subscriptionExpireTime < new Date().getTime()) album.subscribeview = undefined
      if (album.status !== 1) res.send({ code: 200, data: { _id: album._id, status: album.status } })
      if (album.status === 1) res.send({ code: 200, data: album })
    }

  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/album/find/favorited', async (req, res) => {
  const { authorization } = req.headers
  const { album_id } = req.body

  try {
    {
      if (typeof authorization !== 'string' && typeof authorization !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof album_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const albumExist = await Mongo.client.db(Collection).collection('Album').findOne({ _id: new ObjectId(album_id) }, { projection: { _id: 1 } })

      if (albumExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const user = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, albumFavoriteds_id: 1 } })

    const favorited = user.albumFavoriteds_id.some(i => String(i) === String(album_id))

    res.send({ code: 200, data: favorited })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/album/find/list', async (req, res) => {
  const { authorization } = req.headers
  const { filter, seed, skip, limit } = req.body

  try {
    {
      if (typeof authorization !== 'string' && typeof authorization !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter !== 'object' && typeof filter !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && typeof filter.name !== 'string' && typeof filter.name !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && Array.isArray(filter.tag) !== true && typeof filter.tag !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && Array.isArray(filter.actor) !== true && typeof filter.actor !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && Array.isArray(filter.status) !== true && typeof filter.status !== 'number' && typeof filter.status !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && typeof filter.favorited !== 'boolean' && typeof filter.favorited !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && typeof filter.user_id !== 'string' && typeof filter.user_id !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof seed !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof skip !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof limit !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const user = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, albumFavoriteds_id: 1 } })

    const match = {}

    if (filter) {
      if (filter.name) match.name = { $regex: filter.name }

      if (filter.tag && filter.tag.length > 0) match.tag = { $in: filter.tag }
      if (filter.actor && filter.actor.length > 0) match.actor = { $in: filter.actor }
      if (filter.status && filter.status.length > 0) match.status = { $in: filter.status }

      if (user && filter.favorited === true) match._id = { $in: user.albumFavoriteds_id }

      if (filter.user_id === 'nonself' && user) match.user_id = { $not: { $eq: user._id } }
      if (filter.user_id !== 'nonself' && filter.user_id && filter.user_id.length === 24) match.user_id = { $eq: new ObjectId(filter.user_id) }
    }

    const pipelineAlbum = [
      { $match: match },
      { $project: { seed: { $mod: ['$createTime', seed] }, _id: 1, name: 1, poster: 1, status: 1, createTime: 1, updateTime: 1 } },
      { $sort: { seed: -1, createTime: -1 } },
    ]

    const album = await Mongo.client.db(Collection).collection('Album').aggregate(pipelineAlbum).skip(skip).limit(limit).toArray()

    const pipelineAlbumFavoriteds = [
      { $match: { albumFavoriteds_id: { $in: album.map(i => i._id) } } },
      { $unwind: '$albumFavoriteds_id' },
      { $group: { _id: '$albumFavoriteds_id', albumFavoriteds_id: { $sum: 1 } } }
    ]

    const albumFavoriteds_id = await Mongo.client.db(Collection).collection('User').aggregate(pipelineAlbumFavoriteds).toArray()

    album.forEach(i => {
      i.favorited = Boolean(user && user.albumFavoriteds_id.some(n => String(n) === String(i._id)))
      i.favoritedCount = albumFavoriteds_id.find(n => String(n._id) === String(i._id))?.albumFavoriteds_id || 0
      delete i.seed
    })

    res.send({ code: 200, data: album })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/album/find/tag', async (req, res) => {
  const { match } = req.body

  try {
    {
      if (typeof match !== 'string' && typeof match !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const pipeline = [
      { $match: { tag: { $regex: match || '' }, status: 1 } },
      { $unwind: '$tag' },
      { $group: { _id: '$tag', count: { $sum: 1 } } },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]

    const album = await Mongo.client.db(Collection).collection('Album').aggregate(pipeline).toArray()

    res.send({ code: 200, data: album })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/album/find/actor', async (req, res) => {
  const { match } = req.body

  try {
    {
      if (typeof match !== 'string' && typeof match !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const pipeline = [
      { $match: { actor: { $regex: match || '' }, status: 1 } },
      { $unwind: '$actor' },
      { $group: { _id: '$actor', count: { $sum: 1 } } },
      { $project: { _id: 0, actor: '$_id', count: 1 } },
    ]

    const album = await Mongo.client.db(Collection).collection('Album').aggregate(pipeline).toArray()

    res.send({ code: 200, data: album })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/admin/album/insert', async (req, res) => {
  const { authorization } = req.headers
  const { name, description, tag, actor, poster, preview, subscribeview, status } = req.body

  try {
    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof name !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof description !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(tag) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(actor) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(poster) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(preview) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof subscribeview !== 'object') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof status !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      if (tag.some(i => typeof i !== 'string')) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (actor.some(i => typeof i !== 'string')) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (poster.some(i => typeof i !== 'object')) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (preview.some(i => typeof i !== 'object')) throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (userExist.subscription !== 'administrator') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const album = await Mongo.client.db(Collection).collection('Album').insertOne({ name, description, tag, actor, poster, preview, subscribeview, status, createTime: new Date().getTime(), updateTime: new Date().getTime() })

    res.send({ code: 200, data: album })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/admin/album/update', async (req, res) => {
  const { authorization } = req.headers
  const { album_id, name, description, tag, actor, poster, preview, subscribeview, status } = req.body

  try {
    {
      if (typeof album_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof name !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof description !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(tag) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(actor) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(poster) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(preview) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof subscribeview !== 'object') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof status !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1 } })
      const albumExist = await Mongo.client.db(Collection).collection('Album').findOne({ _id: new ObjectId(album_id) }, { projection: { _id: 1, user_id: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (userExist.subscription !== 'administrator') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (albumExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    await Mongo.client.db(Collection).collection('Album').updateOne({ _id: new ObjectId(album_id) }, { $set: { name, description, tag, actor, poster, preview, subscribeview, status, updateTime: new Date().getTime() } })

    res.send({ code: 200 })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/admin/album/delete', async (req, res) => {
  const { authorization } = req.headers
  const { album_id } = req.body

  try {
    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof album_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1 } })
      const albumExist = await Mongo.client.db(Collection).collection('Album').findOne({ _id: new ObjectId(album_id) }, { projection: { _id: 1, user_id: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (userExist.subscription !== 'administrator') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (albumExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    await Mongo.client.db(Collection).collection('Album').deleteMany({ _id: new ObjectId(album_id) })

    res.send({ code: 200 })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

/* Album API END */

/* Cartoon API START */

router.post('/api/app/cartoon/find', async (req, res) => {
  const { authorization } = req.headers
  const { cartoon_id } = req.body

  try {
    {
      if (typeof authorization !== 'string' && typeof authorization !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof cartoon_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const cartoonExist = await Mongo.client.db(Collection).collection('Cartoon').findOne({ _id: new ObjectId(cartoon_id) }, { projection: { _id: 1 } })

      if (cartoonExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const user = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1, subscriptionExpireTime: 1, cartoonFavoriteds_id: 1 } })
    const cartoon = await Mongo.client.db(Collection).collection('Cartoon').findOne({ _id: new ObjectId(cartoon_id) })

    const pipelineCartoonFavoriteds = [
      { $match: { cartoonFavoriteds_id: { $in: [cartoon._id] } } },
      { $unwind: '$cartoonFavoriteds_id' },
      { $group: { _id: '$cartoonFavoriteds_id', cartoonFavoriteds_id: { $sum: 1 } } }
    ]

    const cartoonFavoriteds_id = await Mongo.client.db(Collection).collection('User').aggregate(pipelineCartoonFavoriteds).toArray()

    cartoon.favorited = Boolean(user && user.cartoonFavoriteds_id.some(i => String(i) === String(cartoon._id)))
    cartoon.favoritedCount = cartoonFavoriteds_id.find(i => String(i._id) === String(cartoon._id))?.cartoonFavoriteds_id || 0

    if (user.subscription !== 'administrator') {
      if (!user.subscription.includes('cartoon') || user.subscriptionExpireTime < new Date().getTime()) {
        cartoon.subscribeview = undefined
      }
    }

    if (cartoon.status !== 1) res.send({ code: 200, data: { _id: cartoon._id, status: cartoon.status } })
    if (cartoon.status === 1) res.send({ code: 200, data: cartoon })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/cartoon/find/favorited', async (req, res) => {
  const { authorization } = req.headers
  const { cartoon_id } = req.body

  try {
    {
      if (typeof authorization !== 'string' && typeof authorization !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof cartoon_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const cartoonExist = await Mongo.client.db(Collection).collection('Cartoon').findOne({ _id: new ObjectId(cartoon_id) }, { projection: { _id: 1 } })

      if (cartoonExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const user = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, cartoonFavoriteds_id: 1 } })

    const favorited = user.cartoonFavoriteds_id.some(i => String(i) === String(cartoon_id))

    res.send({ code: 200, data: favorited })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/cartoon/find/list', async (req, res) => {
  const { authorization } = req.headers
  const { filter, seed, skip, limit } = req.body

  try {
    {
      if (typeof authorization !== 'string' && typeof authorization !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter !== 'object' && typeof filter !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && typeof filter.name !== 'string' && typeof filter.name !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && Array.isArray(filter.tag) !== true && typeof filter.tag !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && Array.isArray(filter.actor) !== true && typeof filter.actor !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && Array.isArray(filter.status) !== true && typeof filter.status !== 'number' && typeof filter.status !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && typeof filter.favorited !== 'boolean' && typeof filter.favorited !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && typeof filter.user_id !== 'string' && typeof filter.user_id !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof seed !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof skip !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof limit !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const user = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, cartoonFavoriteds_id: 1 } })

    const match = {}

    if (filter) {
      if (filter.name) match.name = { $regex: filter.name }

      if (filter.tag && filter.tag.length > 0) match.tag = { $in: filter.tag }
      if (filter.actor && filter.actor.length > 0) match.actor = { $in: filter.actor }
      if (filter.status && filter.status.length > 0) match.status = { $in: filter.status }

      if (user && filter.favorited === true) match._id = { $in: user.cartoonFavoriteds_id }

      if (filter.user_id === 'nonself' && user) match.user_id = { $not: { $eq: user._id } }
      if (filter.user_id !== 'nonself' && filter.user_id && filter.user_id.length === 24) match.user_id = { $eq: new ObjectId(filter.user_id) }
    }

    const pipelineCartoon = [
      { $match: match },
      { $project: { seed: { $mod: ['$createTime', seed] }, _id: 1, name: 1, poster: 1, status: 1, createTime: 1, updateTime: 1 } },
      { $sort: { seed: -1, createTime: -1 } },
    ]

    const cartoon = await Mongo.client.db(Collection).collection('Cartoon').aggregate(pipelineCartoon).skip(skip).limit(limit).toArray()

    const pipelineCartoonFavoriteds = [
      { $match: { cartoonFavoriteds_id: { $in: cartoon.map(i => i._id) } } },
      { $unwind: '$cartoonFavoriteds_id' },
      { $group: { _id: '$cartoonFavoriteds_id', cartoonFavoriteds_id: { $sum: 1 } } }
    ]

    const cartoonFavoriteds_id = await Mongo.client.db(Collection).collection('User').aggregate(pipelineCartoonFavoriteds).toArray()

    cartoon.forEach(i => {
      i.favorited = Boolean(user && user.cartoonFavoriteds_id.some(n => String(n) === String(i._id)))
      i.favoritedCount = cartoonFavoriteds_id.find(n => String(n._id) === String(i._id))?.cartoonFavoriteds_id || 0
      delete i.seed
    })

    res.send({ code: 200, data: cartoon })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/cartoon/find/tag', async (req, res) => {
  const { match } = req.body

  try {
    {
      if (typeof match !== 'string' && typeof match !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const pipeline = [
      { $match: { tag: { $regex: match || '' }, status: 1 } },
      { $unwind: '$tag' },
      { $group: { _id: '$tag', count: { $sum: 1 } } },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]

    const cartoon = await Mongo.client.db(Collection).collection('Cartoon').aggregate(pipeline).toArray()

    res.send({ code: 200, data: cartoon })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/cartoon/find/actor', async (req, res) => {
  const { match } = req.body

  try {
    {
      if (typeof match !== 'string' && typeof match !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const pipeline = [
      { $match: { actor: { $regex: match || '' }, status: 1 } },
      { $unwind: '$actor' },
      { $group: { _id: '$actor', count: { $sum: 1 } } },
      { $project: { _id: 0, actor: '$_id', count: 1 } },
    ]

    const cartoon = await Mongo.client.db(Collection).collection('Cartoon').aggregate(pipeline).toArray()

    res.send({ code: 200, data: cartoon })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/admin/cartoon/insert', async (req, res) => {
  const { authorization } = req.headers
  const { name, description, tag, actor, poster, preview, subscribeview, status } = req.body

  try {
    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof name !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof description !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(tag) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(actor) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(poster) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(preview) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof subscribeview !== 'object') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof status !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      if (tag.some(i => typeof i !== 'string')) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (actor.some(i => typeof i !== 'string')) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (poster.some(i => typeof i !== 'object')) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (preview.some(i => typeof i !== 'object')) throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (userExist.subscription !== 'administrator') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const cartoon = await Mongo.client.db(Collection).collection('Cartoon').insertOne({ name, description, tag, actor, poster, preview, subscribeview, status, createTime: new Date().getTime(), updateTime: new Date().getTime() })

    res.send({ code: 200, data: cartoon })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/admin/cartoon/update', async (req, res) => {
  const { authorization } = req.headers
  const { cartoon_id, name, description, tag, actor, poster, preview, subscribeview, status } = req.body

  try {
    {
      if (typeof cartoon_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof name !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof description !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(tag) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(actor) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(poster) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(preview) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof subscribeview !== 'object') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof status !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1 } })
      const cartoonExist = await Mongo.client.db(Collection).collection('Cartoon').findOne({ _id: new ObjectId(cartoon_id) }, { projection: { _id: 1, user_id: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (userExist.subscription !== 'administrator') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (cartoonExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    await Mongo.client.db(Collection).collection('Cartoon').updateOne({ _id: new ObjectId(cartoon_id) }, { $set: { name, description, tag, actor, poster, preview, subscribeview, status, updateTime: new Date().getTime() } })

    res.send({ code: 200 })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/admin/cartoon/delete', async (req, res) => {
  const { authorization } = req.headers
  const { cartoon_id } = req.body

  try {
    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof cartoon_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1 } })
      const cartoonExist = await Mongo.client.db(Collection).collection('Cartoon').findOne({ _id: new ObjectId(cartoon_id) }, { projection: { _id: 1, user_id: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (userExist.subscription !== 'administrator') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (cartoonExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    await Mongo.client.db(Collection).collection('Cartoon').deleteMany({ _id: new ObjectId(cartoon_id) })

    res.send({ code: 200 })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

/* Cartoon API END */

/* Video API START */

router.post('/api/app/video/find', async (req, res) => {
  const { authorization } = req.headers
  const { video_id } = req.body

  try {
    {
      if (typeof authorization !== 'string' && typeof authorization !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof video_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const videoExist = await Mongo.client.db(Collection).collection('Video').findOne({ _id: new ObjectId(video_id) }, { projection: { _id: 1 } })

      if (videoExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const user = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1, videoFavoriteds_id: 1 } })
    const video = await Mongo.client.db(Collection).collection('Video').findOne({ _id: new ObjectId(video_id) })
    const userSelf = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1 } })
    const userCreator = await Mongo.client.db(Collection).collection('User').findOne({ _id: video.user_id }, { projection: { _id: 1 } })

    const pipelineVideoFavoriteds = [
      { $match: { videoFavoriteds_id: { $in: [video._id] } } },
      { $unwind: '$videoFavoriteds_id' },
      { $group: { _id: '$videoFavoriteds_id', videoFavoriteds_id: { $sum: 1 } } }
    ]

    const videoFavoriteds_id = await Mongo.client.db(Collection).collection('User').aggregate(pipelineVideoFavoriteds).toArray()

    video.own = Boolean(user && String(user._id) === String(video.user_id))
    video.favorited = Boolean(user && user.videoFavoriteds_id.some(i => String(i) === String(video._id)))
    video.favoritedCount = videoFavoriteds_id.find(i => String(i._id) === String(video._id))?.videoFavoriteds_id || 0
    video.user = userCreator

    video.user.self = Boolean(userSelf && String(video.user._id) === String(userSelf._id))

    if (video.own === false) {
      if (video.status !== 1) res.send({ code: 200, data: { _id: video._id, status: video.status } })
      if (video.status === 1) res.send({ code: 200, data: video })
    }

    if (video.own === true) {
      res.send({ code: 200, data: video })
    }
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/video/find/favorited', async (req, res) => {
  const { authorization } = req.headers
  const { video_id } = req.body

  try {
    {
      if (typeof authorization !== 'string' && typeof authorization !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof video_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const videoExist = await Mongo.client.db(Collection).collection('Video').findOne({ _id: new ObjectId(video_id) }, { projection: { _id: 1 } })

      if (videoExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const user = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, videoFavoriteds_id: 1 } })

    const favorited = user.videoFavoriteds_id.some(i => String(i) === String(video_id))

    res.send({ code: 200, data: favorited })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/video/find/list', async (req, res) => {
  const { authorization } = req.headers
  const { filter, seed, skip, limit } = req.body

  try {
    {
      if (typeof authorization !== 'string' && typeof authorization !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter !== 'object' && typeof filter !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && typeof filter.name !== 'string' && typeof filter.name !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && Array.isArray(filter.tag) !== true && typeof filter.tag !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && Array.isArray(filter.actor) !== true && typeof filter.actor !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && Array.isArray(filter.status) !== true && typeof filter.status !== 'number' && typeof filter.status !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && typeof filter.favorited !== 'boolean' && typeof filter.favorited !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof filter === 'object' && typeof filter.user_id !== 'string' && typeof filter.user_id !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof seed !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof skip !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof limit !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const user = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, videoFavoriteds_id: 1 } })

    const match = {}

    if (filter) {
      if (filter.name) match.name = { $regex: filter.name }

      if (filter.tag && filter.tag.length > 0) match.tag = { $in: filter.tag }
      if (filter.actor && filter.actor.length > 0) match.actor = { $in: filter.actor }
      if (filter.status && filter.status.length > 0) match.status = { $in: filter.status }

      if (user && filter.favorited === true) match._id = { $in: user.videoFavoriteds_id }

      if (filter.user_id === 'nonself' && user) match.user_id = { $not: { $eq: user._id } }
      if (filter.user_id !== 'nonself' && filter.user_id && filter.user_id.length === 24) match.user_id = { $eq: new ObjectId(filter.user_id) }
    }

    const pipelineVideo = [
      { $match: match },
      { $lookup: { from: "User", localField: "user_id", foreignField: "_id", as: "user" } },
      { $addFields: { user: { $first: "$user" } } },
      { $project: { seed: { $mod: ['$createTime', seed] }, _id: 1, name: 1, poster: 1, status: 1, createTime: 1, updateTime: 1, user_id: 1, user: { _id: '$user._id' } } },
      { $sort: { seed: -1, createTime: -1 } },
    ]

    const video = await Mongo.client.db(Collection).collection('Video').aggregate(pipelineVideo).skip(skip).limit(limit).toArray()

    const pipelineVideoFavoriteds = [
      { $match: { videoFavoriteds_id: { $in: video.map(i => i._id) } } },
      { $unwind: '$videoFavoriteds_id' },
      { $group: { _id: '$videoFavoriteds_id', videoFavoriteds_id: { $sum: 1 } } }
    ]

    const videoFavoriteds_id = await Mongo.client.db(Collection).collection('User').aggregate(pipelineVideoFavoriteds).toArray()

    video.forEach(i => {
      i.own = Boolean(user && String(user._id) === String(i.user_id))
      i.favorited = Boolean(user && user.videoFavoriteds_id.some(n => String(n) === String(i._id)))
      i.favoritedCount = videoFavoriteds_id.find(n => String(n._id) === String(i._id))?.videoFavoriteds_id || 0
      delete i.seed
    })

    res.send({ code: 200, data: video })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/video/find/tag', async (req, res) => {
  const { match } = req.body

  try {
    {
      if (typeof match !== 'string' && typeof match !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const pipeline = [
      { $match: { tag: { $regex: match || '' }, status: 1 } },
      { $unwind: '$tag' },
      { $group: { _id: '$tag', count: { $sum: 1 } } },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]

    const video = await Mongo.client.db(Collection).collection('Video').aggregate(pipeline).toArray()

    res.send({ code: 200, data: video })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/video/find/actor', async (req, res) => {
  const { match } = req.body

  try {
    {
      if (typeof match !== 'string' && typeof match !== 'undefined') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const pipeline = [
      { $match: { actor: { $regex: match || '' }, status: 1 } },
      { $unwind: '$actor' },
      { $group: { _id: '$actor', count: { $sum: 1 } } },
      { $project: { _id: 0, actor: '$_id', count: 1 } },
    ]

    const video = await Mongo.client.db(Collection).collection('Video').aggregate(pipeline).toArray()

    res.send({ code: 200, data: video })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/admin/video/insert', async (req, res) => {
  const { authorization } = req.headers
  const { name, description, tag, actor, poster, preview, subscribeview, status } = req.body

  try {
    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof name !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof description !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(tag) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(actor) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(poster) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(preview) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof subscribeview !== 'object') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof status !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      if (tag.some(i => typeof i !== 'string')) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (actor.some(i => typeof i !== 'string')) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (poster.some(i => typeof i !== 'object')) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (preview.some(i => typeof i !== 'object')) throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (userExist.subscription !== 'administrator') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const video = await Mongo.client.db(Collection).collection('Video').insertOne({ name, description, tag, actor, poster, preview, subscribeview, status, createTime: new Date().getTime(), updateTime: new Date().getTime() })

    res.send({ code: 200, data: video })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/admin/video/update', async (req, res) => {
  const { authorization } = req.headers
  const { video_id, name, description, tag, actor, poster, preview, subscribeview, status } = req.body

  try {
    {
      if (typeof video_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof name !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof description !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(tag) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(actor) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(poster) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (Array.isArray(preview) === false) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof subscribeview !== 'object') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof status !== 'number') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1 } })
      const videoExist = await Mongo.client.db(Collection).collection('Video').findOne({ _id: new ObjectId(video_id) }, { projection: { _id: 1, user_id: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (userExist.subscription !== 'administrator') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (videoExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    await Mongo.client.db(Collection).collection('Video').updateOne({ _id: new ObjectId(video_id) }, { $set: { name, description, tag, actor, poster, preview, subscribeview, status, updateTime: new Date().getTime() } })

    res.send({ code: 200 })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

router.post('/api/app/admin/video/delete', async (req, res) => {
  const { authorization } = req.headers
  const { video_id } = req.body

  try {
    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (typeof video_id !== 'string') throw { error: new Error(), data: { code: 500, message: '异常错误' } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1 } })
      const videoExist = await Mongo.client.db(Collection).collection('Video').findOne({ _id: new ObjectId(video_id) }, { projection: { _id: 1, user_id: 1 } })

      if (userExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (userExist.subscription !== 'administrator') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
      if (videoExist === null) throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    await Mongo.client.db(Collection).collection('Video').deleteMany({ _id: new ObjectId(video_id) })

    res.send({ code: 200 })
  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }

})

/* Video API END */

/* File API START */

router.post('/api/app/upload', async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    const data = await form.parse(req)

    const { authorization } = req.headers
    const dir = data[0].dir[0]
    const file = data[1].file[0]

    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500 } }
      if (typeof dir !== 'string') throw { error: new Error(), data: { code: 500 } }
      if (typeof file !== 'object') throw { error: new Error(), data: { code: 500 } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1 } })

      if (userExist === null || userExist.subscription !== 'administrator') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    const dirComplete = `/${dir}`.replace(/\/+/g, '/')

    if (dirComplete.includes('../')) throw { error: new Error(), data: { code: 500 } }

    const targetPath = path.join(__dirname, '../public', dirComplete)
    const parentDir = path.dirname(targetPath)
    const exist = fs.existsSync(targetPath)

    if (exist === true) fs.unlinkSync(targetPath)

    fs.mkdirSync(parentDir, { recursive: true })
    fs.renameSync(file.filepath, targetPath)

    await new Promise(resolve => setTimeout(resolve, 1000))

    res.send({ code: 200, data: dirComplete })

  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }
})

router.post('/api/app/upload/delete', async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    const data = await form.parse(req)

    const { authorization } = req.headers
    const dir = data[0].dir[0]

    {
      if (typeof authorization !== 'string') throw { error: new Error(), data: { code: 500 } }
      if (typeof dir !== 'string') throw { error: new Error(), data: { code: 500 } }

      const userExist = await Mongo.client.db(Collection).collection('User').findOne({ authorization: authorization }, { projection: { _id: 1, subscription: 1 } })

      if (userExist === null || userExist.subscription !== 'administrator') throw { error: new Error(), data: { code: 500, message: '异常错误' } }
    }

    if (dir.includes('../')) throw { error: new Error(), data: { code: 500 } }

    const targetPath = path.join(__dirname, '../public', + '/' + dir)
    const exist = fs.existsSync(targetPath)

    if (exist === true) {
      const isFile = fs.statSync(targetPath).isFile()
      const isDirectory = fs.statSync(targetPath).isDirectory()

      if (isFile === true) {
        fs.unlinkSync(targetPath)
      }

      if (isDirectory === true) {
        fs.rmdirSync(targetPath, { recursive: true })
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    res.send({ code: 200 })

  } catch (e) {
    if (process.argv.includes('--dev')) { console.log(e?.error || e) }; res.status(e?.data?.status || 500).send({ code: e?.data?.code || 500, message: e?.data?.message || '异常错误' })
  }
})

/* File API END */

module.exports = router