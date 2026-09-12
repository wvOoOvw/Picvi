const fs = require('fs')
const path = require('path')
const CryptoJS = require('crypto-js')
const { encryptBuffer } = require('../../../common/crypto-node.js').createCrypto(CryptoJS)

const origin_path = path.resolve(__dirname, './src')
const target_path = path.resolve(__dirname, './build')

if (fs.existsSync(target_path)) fs.rmSync(target_path, { recursive: true, force: true })

fs.mkdirSync(target_path)

function processDir(origin, target) {
  const entries = fs.readdirSync(origin).filter(i => !i.includes('.DS_Store'))

  for (const entry of entries) {
    const originPath = path.join(origin, entry)
    const stat = fs.statSync(originPath)

    if (stat.isDirectory()) {
      fs.mkdirSync(path.join(target, entry), { recursive: true })
      processDir(originPath, path.join(target, entry))
    }
    if (stat.isFile()) {
      const buffer = fs.readFileSync(originPath)
      const encrypted = encryptBuffer(buffer)
      fs.writeFileSync(path.join(target, `${entry}.enc`), encrypted)
    }
  }
}

processDir(origin_path, target_path)
