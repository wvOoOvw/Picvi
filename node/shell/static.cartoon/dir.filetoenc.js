const fs = require('fs')
const path = require('path')
const CryptoJS = require('crypto-js')
const { encryptBuffer } = require('../../../common/crypto-node.js').createCrypto(CryptoJS)

const origin_path = path.resolve(__dirname, './src')
const target_path = path.resolve(__dirname, './build')

if (fs.existsSync(target_path)) fs.rmSync(target_path, { recursive: true, force: true })

fs.mkdirSync(target_path)

function processDir(origin, target) {
  const files = fs.readdirSync(origin).filter(i => !i.includes('.DS_Store'))

  for (const file of files) {
    const originPath = path.join(origin, file)
    const targetPath = path.join(target, file)
    const stat = fs.statSync(originPath)

    if (stat.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true })
      processDir(originPath, targetPath)
    }
    if (stat.isFile()) {
      if (file === '_.json') {
        fs.copyFileSync(originPath, targetPath)
        continue
      }
      const buffer = fs.readFileSync(originPath)
      const encrypted = encryptBuffer(buffer)
      fs.writeFileSync(targetPath + '.enc', encrypted)
    }
  }
}

processDir(origin_path, target_path)
