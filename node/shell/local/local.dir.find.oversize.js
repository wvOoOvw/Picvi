const fs = require('fs')

const target_path = 'E:/Picvi'
const max_size = 100 * 1024

const findOversizeFile = dir => {
  fs.readdirSync(dir).forEach(file => {

    const path = dir + '/' + file

    const isFile = fs.statSync(path).isFile()
    const isDirectory = fs.statSync(path).isDirectory()

    if (isFile && fs.statSync(path).size < max_size) {
      console.log('find', path)
    }

    if (isDirectory) findOversizeFile(path)

  })
}

findOversizeFile(target_path)
