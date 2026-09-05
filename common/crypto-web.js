import { Key, SALT, ITERATIONS, KEY_LENGTH, MIME_MAP } from './crypto.js'

export const createCrypto = (CryptoJS) => {
    const getKey = () =>
        CryptoJS.PBKDF2(Key, SALT, {
            keySize: KEY_LENGTH / 32,
            iterations: ITERATIONS,
            hasher: CryptoJS.algo.SHA256,
        })

    const toWordArray = (buffer) => {
        const u8 = new Uint8Array(buffer)
        const words = []
        for (let i = 0; i < u8.length; i++) words[i >>> 2] |= u8[i] << (24 - (i % 4) * 8)
        return CryptoJS.lib.WordArray.create(words, u8.length)
    }

    const fromWordArray = (wordArray) => {
        const { words, sigBytes } = wordArray
        const u8 = new Uint8Array(sigBytes)
        for (let i = 0; i < sigBytes; i++) u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
        return u8
    }

    const encryptBlob = async (file) => {
        const key = getKey()
        const buffer = await file.arrayBuffer()
        const iv = CryptoJS.lib.WordArray.random(16)
        const plaintext = toWordArray(buffer)

        const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        })
        const ciphertext = encrypted.ciphertext

        const mac = CryptoJS.HmacSHA256(iv.clone().concat(ciphertext), key)

        const ivU8 = fromWordArray(iv)
        const ctU8 = fromWordArray(ciphertext)
        const macU8 = fromWordArray(mac)

        const result = new Uint8Array(16 + ctU8.length + 32)
        result.set(ivU8, 0)
        result.set(ctU8, 16)
        result.set(macU8, 16 + ctU8.length)
        return new Blob([result], { type: 'application/octet-stream' })
    }

    const decryptArrayBuffer = async (buffer, mimeType) => {
        const key = getKey()
        const view = new Uint8Array(buffer)
        const iv = toWordArray(view.slice(0, 16).buffer)
        const ciphertext = toWordArray(view.slice(16, view.length - 32).buffer)
        const macU8 = view.slice(view.length - 32)

        const expectedMac = CryptoJS.HmacSHA256(iv.clone().concat(ciphertext), key)
        const expectedU8 = fromWordArray(expectedMac)
        if (!macU8.every((b, i) => b === expectedU8[i])) throw new Error('MAC check failed')

        const decrypted = CryptoJS.AES.decrypt(
            CryptoJS.lib.CipherParams.create({ ciphertext }),
            key,
            { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        )
        return new Blob([fromWordArray(decrypted)], { type: mimeType || 'image/jpeg' })
    }

    const getEncUrlMime = (url) => {
        const ext = url.replace(/\.enc$/, '').match(/\.([a-zA-Z0-9]+)$/)?.[1]
        return MIME_MAP[ext] || 'application/octet-stream'
    }

    return { encryptBlob, decryptArrayBuffer, getEncUrlMime }
}
