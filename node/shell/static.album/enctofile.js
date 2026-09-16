const fs = require('fs')
const path = require('path')
const CryptoJS = require('crypto-js')
const { decryptBuffer } = require('../../../common/crypto-node.js').createCrypto(CryptoJS)

const origin_path = path.resolve(__dirname, './src')
const target_path = path.resolve(__dirname, './build')

if (fs.existsSync(target_path)) fs.rmSync(target_path, { recursive: true, force: true })

fs.mkdirSync(target_path)

function processDir(origin, target) {
  const entries = fs.readdirSync(origin).filter(i => !i.includes('.DS_Store'))

  for (const entry of entries) {
    const originPath = path.join(origin, entry)
    const targetPath = path.join(target, entry)
    const stat = fs.statSync(originPath)

    if (stat.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true })
      processDir(originPath, targetPath)
    }
    if (stat.isFile()) {
      const read = fs.readFileSync(originPath)
      const decrypted = decryptBuffer(read)
      fs.writeFileSync(targetPath.replace(/\.enc$/, ''), decrypted)
    }
  }
}

processDir(origin_path, target_path)
