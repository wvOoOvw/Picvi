const extension = (url) => {
  if (!url) return 'Unknown'

  const lowerUrl = url.toLowerCase()

  if (
    lowerUrl.includes('.mp4') ||
    lowerUrl.includes('.webm') ||
    lowerUrl.includes('.mov') ||
    lowerUrl.includes('.avi')
  ) {
    return 'Video'
  }

  if (
    lowerUrl.includes('.jpg') ||
    lowerUrl.includes('.jpeg') ||
    lowerUrl.includes('.png') ||
    lowerUrl.includes('.gif') ||
    lowerUrl.includes('.bmp') ||
    lowerUrl.includes('.webp') ||
    lowerUrl.includes('.svg')
  ) {
    return 'Image'
  }

  return 'Unknown'
}

export { extension }