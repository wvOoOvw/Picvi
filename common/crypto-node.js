const { Key, SALT, ITERATIONS, KEY_LENGTH, MIME_MAP } = require('./crypto.js')

const createCrypto = (CryptoJS) => {
    let cachedKey = null
    const getKey = () => {
        if (!cachedKey)
            cachedKey = CryptoJS.PBKDF2(Key, SALT, {
                keySize: KEY_LENGTH / 32,
                iterations: ITERATIONS,
                hasher: CryptoJS.algo.SHA256,
            })
        return cachedKey
    }

    const toWordArray = (buffer) =>
        CryptoJS.lib.WordArray.create(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength))

    const fromWordArray = (wordArray) => {
        const { words, sigBytes } = wordArray
        const buf = Buffer.alloc(sigBytes)
        for (let i = 0; i < sigBytes; i++) buf[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
        return buf
    }

    const encryptBuffer = (buffer) => {
        const key = getKey()
        const iv = CryptoJS.lib.WordArray.random(16)
        const plaintext = toWordArray(buffer)

        const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        })
        const ciphertext = encrypted.ciphertext

        const mac = CryptoJS.HmacSHA256(iv.clone().concat(ciphertext), key)

        return Buffer.concat([fromWordArray(iv), fromWordArray(ciphertext), fromWordArray(mac)])
    }

    const decryptBuffer = (buffer) => {
        const key = getKey()
        const iv = toWordArray(buffer.slice(0, 16))
        const ciphertext = toWordArray(buffer.slice(16, buffer.length - 32))
        const mac = buffer.slice(buffer.length - 32)

        const expectedMac = fromWordArray(CryptoJS.HmacSHA256(iv.clone().concat(ciphertext), key))
        if (!mac.equals(expectedMac)) throw new Error('MAC check failed')

        const decrypted = CryptoJS.AES.decrypt(
            CryptoJS.lib.CipherParams.create({ ciphertext }),
            key,
            { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        )
        return fromWordArray(decrypted)
    }

    const getEncUrlMime = (url) => {
        const ext = url.replace(/\.enc$/, '').match(/\.([a-zA-Z0-9]+)$/)?.[1]
        return MIME_MAP[ext] || 'application/octet-stream'
    }

    return { encryptBuffer, decryptBuffer, getEncUrlMime }
}

module.exports = { createCrypto }
