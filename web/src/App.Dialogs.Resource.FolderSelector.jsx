import React from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'

import FolderIcon from '@mui/icons-material/Folder'
import UploadFileIcon from '@mui/icons-material/UploadFile'

import md5 from 'md5'

import { Context as ContextApp } from './App'

import { Fetch } from './utils.fetch'
import CryptoJS from 'crypto-js'
import { createCrypto } from '../../common/crypto-web.js'

const { encryptBlob } = createCrypto(CryptoJS)

function App() {
  const contextApp = React.useContext(ContextApp)

  const [uploading, setUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [dragOver, setDragOver] = React.useState(false)

  const inputRef = React.useRef(null)

  const _id = contextApp.dialogsArrayAction.props('FolderParse')?._id
  const type = contextApp.dialogsArrayAction.props('FolderParse')?.type
  const onComplete = contextApp.dialogsArrayAction.props('FolderParse')?.onComplete

  const reset = () => {
    setUploading(false)
    setProgress(0)
  }

  const readEntry = async (entry, path = '') => {
    if (entry.isFile) {
      return new Promise(resolve => entry.file(file => {
        Object.defineProperty(file, 'webkitRelativePath', { value: path + file.name, configurable: true, writable: true })
        resolve([file])
      }, () => resolve([])))
    }

    const reader = entry.createReader()
    const entries = []

    while (true) {
      const batch = await new Promise(resolve => reader.readEntries(resolve, () => resolve([])))
      if (batch.length === 0) break
      entries.push(...batch)
    }

    const files = await Promise.all(entries.map(child => readEntry(child, `${path}${entry.name}/`)))
    return files.flat()
  }

  const processFiles = async (files) => {
    if (files.length === 0) return

    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    const videoFiles = files.filter(f => f.type.startsWith('video/'))
    const mediaFiles = [...imageFiles, ...videoFiles]
   
    if (mediaFiles.length === 0) {
      contextApp.messageArrayAction.add('文件夹内未找到图片或视频')
      return
    }

    const name = files[0].webkitRelativePath?.split('/')[0].replace('【', '').replace('】', '').replace(/NO\.\d+/, '').replace('  ', ' ')
    const description = `包含内容：${imageFiles.length}P + ${videoFiles.length}V`
    const subscribeview = []

    if (_id) {
      setUploading(true)
      setProgress(0)

      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i]
        try {
          const encryptedBlob = await encryptBlob(file)
          const ext = file.type.split('/')[1]

          const formData = new FormData()
          formData.append('file', encryptedBlob, `${md5(file.name)}.${ext}.enc`)
          formData.append('dir', `/${type}/${_id}/${md5(file.name)}.${ext}.enc`)

          const res = await Fetch.form('/api/app/upload', formData)
          const link = 'kapi://remote.oss' + res.data
          subscribeview.push(link)
          setProgress(Math.round(((i + 1) / mediaFiles.length) * 100))
        } catch {
          console.log(`上传失败: ${file.name}`)
          contextApp.messageArrayAction.add(`上传失败: ${file.name}`)
        }
      }

      setUploading(false)
    }

    if (onComplete) {
      onComplete({ name, description, subscribeview })
    }

    contextApp.messageArrayAction.add('上传成功')
    contextApp.dialogsArrayAction.remove('FolderParse')
  }

  const onFolderChange = async (e) => {
    const files = Array.from(e.target.files)
    e.target.value = ''
    await processFiles(files)
  }

  const onDrop = async (e) => {
    e.preventDefault()
    setDragOver(false)

    const items = Array.from(e.dataTransfer.items || [])
    const entries = items.map(item => item.webkitGetAsEntry?.()).filter(Boolean)
    const directoryEntries = entries.filter(entry => entry.isDirectory)

    if (directoryEntries.length > 0) {
      const filesArray = await Promise.all(directoryEntries.map(entry => readEntry(entry)))
      await processFiles(filesArray.flat())
      return
    }

    if (entries.length > 0) {
      const filesArray = await Promise.all(entries.map(entry => readEntry(entry)))
      await processFiles(filesArray.flat())
      return
    }

    await processFiles(Array.from(e.dataTransfer.files))
  }

  React.useEffect(() => {
    if (contextApp.dialogsArrayAction.exist('FolderParse')) {
      reset()
    }
  }, [contextApp.dialogsArrayAction.exist('FolderParse')])

  const Component =
    <Dialog open={contextApp.dialogsArrayAction.exist('FolderParse')} onClose={() => !uploading && contextApp.dialogsArrayAction.remove('FolderParse')} sx={{ '& .MuiDialog-paper': { width: 480, maxWidth: 'unset' } }}>
      <DialogTitle>
        <Typography color='primary' style={{ fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderIcon />
          上传文件夹
        </Typography>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input ref={inputRef} type='file' webkitdirectory='' directory='' multiple style={{ display: 'none' }} onChange={onFolderChange} />

        <Button
          fullWidth
          variant='outlined'
          startIcon={<UploadFileIcon />}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          选择文件夹
        </Button>

        <div
          onDragOver={e => { e.preventDefault(); if (!uploading) setDragOver(true) }}
          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false) }}
          onDrop={e => { if (!uploading) onDrop(e) }}
          style={{
            minHeight: 160,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            padding: 16,
            border: `2px dashed ${dragOver ? 'rgba(218, 122, 133, 1)' : 'rgba(0, 0, 0, 0.25)'}`,
            borderRadius: 8,
            background: dragOver ? 'rgba(218, 122, 133, 0.06)' : 'transparent',
            transition: 'border-color 0.2s, background 0.2s'
          }}
        >
          <FolderIcon color={dragOver ? 'primary' : 'disabled'} style={{ fontSize: 40 }} />
          <Typography variant='body2' color='textSecondary' style={{ fontSize: 12, textAlign: 'center' }}>
            {dragOver ? '松开以上传文件夹' : '拖入文件夹到此处'}
          </Typography>
        </div>

        {
          uploading ?
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <LinearProgress variant='determinate' value={progress} style={{ width: '100%' }} />
            </div>
            : null
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={() => contextApp.dialogsArrayAction.remove('FolderParse')} disabled={uploading}>取消</Button>
      </DialogActions>
    </Dialog>

  return Component
}

export default App
