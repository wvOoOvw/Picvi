const fs = require('fs')

const target_path = 'F:/COS'

const removeHiddenFile = dir => {
  fs.readdirSync(dir).forEach(file => {

    const path = dir + '/' + file

    const isFile = fs.statSync(path).isFile()
    const isDirectory = fs.statSync(path).isDirectory()

    if (isFile && file.startsWith('.')) {
      fs.unlinkSync(path)
      console.log('remove', path)
    }

    if (isDirectory) removeHiddenFile(path)

  })
}

removeHiddenFile(target_path)
