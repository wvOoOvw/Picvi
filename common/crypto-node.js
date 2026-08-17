const crypto = require('crypto')
const { Key, SALT, ITERATIONS, KEY_LENGTH, MIME_MAP } = require('./crypto.js')

let cachedKey = null
const getKey = () => {
    if (!cachedKey) cachedKey = crypto.pbkdf2Sync(Key, SALT, ITERATIONS, KEY_LENGTH / 8, 'sha256')
    return cachedKey
}

const encryptBuffer = (buffer) => {
    const key = getKey()
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
    const authTag = cipher.getAuthTag()
    const result = Buffer.alloc(iv.length + encrypted.length + authTag.length)
    iv.copy(result, 0)
    encrypted.copy(result, iv.length)
    authTag.copy(result, iv.length + encrypted.length)
    return result
}

const decryptBuffer = (buffer) => {
    const key = getKey()
    const iv = buffer.slice(0, 12)
    const ciphertext = buffer.slice(12, buffer.length - 16)
    const authTag = buffer.slice(buffer.length - 16)
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)
    return Buffer.concat([decipher.update(ciphertext), decipher.final()])
}

const getEncUrlMime = (url) => {
    const ext = url.replace(/\.enc$/, '').match(/\.([a-zA-Z0-9]+)$/)?.[1]
    return MIME_MAP[ext] || 'application/octet-stream'
}

module.exports = { encryptBuffer, decryptBuffer, getEncUrlMime }
