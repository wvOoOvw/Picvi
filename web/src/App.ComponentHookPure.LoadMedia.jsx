import React from 'react'

import { Fetch } from './utils.fetch'
import { decryptArrayBuffer, getEncUrlMime } from '../../common/crypto-web.js'

const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v']
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']

const useState = (props) => {
  const [mediaSrc, setMediaSrc] = React.useState()
  const [mediaSrcPrevious, setMediaSrcPrevious] = React.useState()
  const [loading, setLoading] = React.useState(false)
  const [loadingSuccess, setLoadingSuccess] = React.useState(false)
  const [loadingFail, setLoadingFail] = React.useState(false)

  const [shouldLoadCount, setShouldLoadCount] = React.useState(performance.now())

  const intersectionRef = React.useRef()

  const loadImage = (src) => {
    const image = new Image()
    image.onload = () => {
      setLoading(false)
      setLoadingSuccess(true)
      setMediaSrc(src)
      if (props.onCallbackSize) props.onCallbackSize({ width: image.width, height: image.height })
    }
    image.onerror = () => {
      setLoading(false)
      setLoadingFail(true)
    }
    image.src = src
  }

  const loadVideo = (src) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadeddata = () => {
      setLoading(false)
      setLoadingSuccess(true)
      setMediaSrc(src)
      if (props.onCallbackSize) props.onCallbackSize({ width: video.videoWidth, height: video.videoHeight })
    }
    video.onerror = () => {
      setLoading(false)
      setLoadingFail(true)
    }
    video.src = src
  }

  const load = () => {
    setLoading(true)
    setLoadingSuccess(false)
    setLoadingFail(false)

    const src = props.src

    if (src && typeof src === 'string') {
      if (src.startsWith('data:video')) {
        loadVideo(src)
      }
      if (src.startsWith('data:image')) {
        loadImage(src)
      }
      if (VIDEO_EXTENSIONS.some(ext => src.endsWith(`.${ext}`))) {
        loadVideo(src)
      }
      if (IMAGE_EXTENSIONS.some(ext => src.endsWith(`.${ext}`))) {
        loadImage(src)
      }
      if (src.endsWith('.enc')) {
        const mimeType = getEncUrlMime(src)

        Fetch.arrayBufferUnauth(src)
          .then(async buffer => {
            const decryptedBlob = await decryptArrayBuffer(buffer, mimeType)
            const blobUrl = URL.createObjectURL(decryptedBlob)

            if (mimeType.startsWith('video/')) {
              loadVideo(blobUrl)
            } else {
              loadImage(blobUrl)
            }
          })
          .catch(() => {
            setLoading(false)
            setLoadingFail(true)
          })
      }
    }

    if (Boolean(src) === false) {
      setLoading(false)
      setLoadingFail(true)
    }
  }

  React.useEffect(() => {
    if (props.lazy !== true) {
      load()
    }

    if (props.lazy === true && intersectionRef.current) {
      const observer = new IntersectionObserver(en => {
        if (en[0].intersectionRatio > 0 && mediaSrc === undefined) load()
      })

      observer.observe(intersectionRef.current)

      return () => observer.disconnect()
    }
  }, [shouldLoadCount])

  React.useEffect(() => {
    setMediaSrc()
    setMediaSrcPrevious(mediaSrc)
    setShouldLoadCount(performance.now())
  }, [props.lazy, props.src])

  return { mediaSrc, mediaSrcPrevious, loading, loadingSuccess, loadingFail, intersectionRef }
}

const LoadMedia = (props) => { const state = useState(props); return props.children(state); }

const useLoadMedia = (props) => { const state = useState(props); return state; }

export { LoadMedia, useLoadMedia }
