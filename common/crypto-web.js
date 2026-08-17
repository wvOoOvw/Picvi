import { Key, SALT, ITERATIONS, KEY_LENGTH, MIME_MAP } from './crypto.js'

const getKey = async () => {
    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(Key), { name: 'PBKDF2' }, false, ['deriveKey'])
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: enc.encode(SALT), iterations: ITERATIONS, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    )
}

const encryptBlob = async (file) => {
    const key = await getKey()
    const buffer = await file.arrayBuffer()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, buffer)

    const result = new ArrayBuffer(iv.byteLength + encrypted.byteLength)
    const view = new Uint8Array(result)
    view.set(iv, 0)
    view.set(new Uint8Array(encrypted), iv.byteLength)
    return new Blob([result], { type: 'application/octet-stream' })
}

const decryptArrayBuffer = async (buffer, mimeType) => {
    const key = await getKey()
    const view = new Uint8Array(buffer)
    const iv = view.slice(0, 12)
    const ciphertext = view.slice(12)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
    return new Blob([decrypted], { type: mimeType || 'image/jpeg' })
}

const getEncUrlMime = (url) => {
    const ext = url.replace(/\.enc$/, '').match(/\.([a-zA-Z0-9]+)$/)?.[1]
    return MIME_MAP[ext] || 'application/octet-stream'
}

export { encryptBlob, decryptArrayBuffer, getEncUrlMime }
