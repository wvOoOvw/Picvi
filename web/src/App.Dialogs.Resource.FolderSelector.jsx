import React from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'

import FolderIcon from '@mui/icons-material/Folder'
import UploadFileIcon from '@mui/icons-material/UploadFile'

import md5 from 'md5'

import { Context as ContextApp } from '../App'

import { Fetch } from '../utils.fetch'
import { encryptBlob } from '../../../common/crypto-web.js'

function App() {
  const contextApp = React.useContext(ContextApp)

  const [folderName, setFolderName] = React.useState('')
  const [imageCount, setImageCount] = React.useState(0)
  const [videoCount, setVideoCount] = React.useState(0)
  const [uploading, setUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [uploadedLinks, setUploadedLinks] = React.useState([])

  const inputRef = React.useRef(null)

  const _id = contextApp.dialogsArrayAction.props('FolderParse')?._id
  const onComplete = contextApp.dialogsArrayAction.props('FolderParse')?.onComplete

  const reset = () => {
    setFolderName('')
    setImageCount(0)
    setVideoCount(0)
    setUploading(false)
    setProgress(0)
    setUploadedLinks([])
  }

  const onFolderChange = async (e) => {
    const files = Array.from(e.target.files)

    if (files.length === 0) return

    // 解析文件夹名称（取第一个文件的相对路径的第一段）
    const relativePath = files[0].webkitRelativePath || files[0].name
    const parts = relativePath.split('/')
    const dirName = parts.length > 1 ? parts[0] : '未命名'

    // 筛选图片和视频
    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    const videoFiles = files.filter(f => f.type.startsWith('video/'))
    const mediaFiles = [...imageFiles, ...videoFiles]

    setFolderName(dirName)
    setImageCount(imageFiles.length)
    setVideoCount(videoFiles.length)
    setUploadedLinks([])

    if (mediaFiles.length === 0) {
      contextApp.messageArrayAction.add('文件夹内未找到图片或视频')
      return
    }

    const description = `包含内容：${imageFiles.length}P + ${videoFiles.length}V`

    // 没有图集_id时，只解析名称和描述，不上传
    if (!_id) {
      if (onComplete) {
        onComplete({ name: dirName, description })
      }
      contextApp.messageArrayAction.add('解析完成')
      contextApp.dialogsArrayAction.remove('FolderParse')
      return
    }

    // 有图集_id时，上传文件
    setUploading(true)
    setProgress(0)

    const links = []
    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i]
      try {
        const encryptedBlob = await encryptBlob(file)
        const ext = file.type.split('/')[1]

        const formData = new FormData()
        formData.append('file', encryptedBlob, `${md5(file.name)}.${ext}.enc`)
        formData.append('dir', `/album/${_id}/${md5(file.name)}.${ext}.enc`)

        const res = await Fetch.form('/api/app/upload', formData)
        const link = 'kapi://remote.oss' + res.data
        links.push(link)
        setUploadedLinks([...links])
        setProgress(Math.round(((i + 1) / mediaFiles.length) * 100))
      } catch (err) {
        contextApp.messageArrayAction.add(`上传失败: ${file.name}`)
      }
    }

    setUploading(false)

    if (onComplete) {
      onComplete({ name: dirName, description, subscribeview: links })
    }

    contextApp.messageArrayAction.add(`上传完成: ${links.length}个文件`)
    contextApp.dialogsArrayAction.remove('FolderParse')
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
      <DialogContent style={{ paddingTop: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            ref={inputRef}
            type='file'
            webkitdirectory=''
            directory=''
            multiple
            style={{ display: 'none' }}
            onChange={onFolderChange}
          />

          <Button
            variant='outlined'
            startIcon={<UploadFileIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            fullWidth
          >
            选择文件夹
          </Button>

          {folderName ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Typography variant='body2' style={{ fontSize: 14 }}>
                文件夹名称：<b>{folderName}</b>
              </Typography>
              <Typography variant='body2' style={{ fontSize: 14 }}>
                包含内容：<b>{imageCount}P + {videoCount}V</b>（{imageCount + videoCount}个文件）
              </Typography>
            </div>
          ) : null}

          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <CircularProgress color='primary' size={32} />
              <Typography variant='body2' style={{ fontSize: 14 }}>
                上传中... {progress}%（{uploadedLinks.length}/{imageCount + videoCount}）
              </Typography>
              <LinearProgress variant='determinate' value={progress} style={{ width: '100%' }} />
            </div>
          ) : null}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => contextApp.dialogsArrayAction.remove('FolderParse')} disabled={uploading}>取消</Button>
      </DialogActions>
    </Dialog>

  return Component
}

export default App
