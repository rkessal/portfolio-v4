self.onmessage = async ({ data: { url, key } }) => {
  const response = await fetch(url)
  const blob = await response.blob()
  const bitmap = await createImageBitmap(blob, { imageOrientation: 'flipY' })
  self.postMessage({ key, bitmap }, [bitmap]) // transfer, not copy
}