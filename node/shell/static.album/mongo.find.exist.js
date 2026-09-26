const fs = require('fs')
const path = require('path')

const { ObjectId, Mongo, Collection } = require('../../src/utils.mongo')

const target_path = path.resolve(__dirname, './._build')

const _run = async () => {
  const dirs = fs.readdirSync(target_path).filter(i => !i.includes('.DS_Store'))

  console.log(`Total folders in ${target_path}:`, dirs.length)

  const found = []
  const notFound = []

  for (const dir of dirs) {
    const name = dir.replace('【', '').replace('】', '').replace(/NO\.\d+/, '').replace('  ', ' ').trim()

    // 查找对应的漫画记录
    const album = await Mongo.client.db(Collection).collection('Album').findOne({ name: name })

    if (album) {
      found.push({
        folder: dir,
        name: name,
        _id: String(album._id)
      })
      console.log('✓ Found:', dir, '→', name, `(${String(album._id)})`)
    } else {
      notFound.push({
        folder: dir,
        name: name
      })
      console.log('✗ Not found:', dir, '→', name)
    }
  }

  console.log('\n=== Summary ===')
  console.log('Found:', found.length)
  console.log('Not found:', notFound.length)

  if (notFound.length > 0) {
    console.log('\n=== Not found folders ===')
    notFound.forEach(item => {
      console.log(`- ${item.folder} (${item.name})`)
    })
  }

  await Mongo.close()
}

_run()
