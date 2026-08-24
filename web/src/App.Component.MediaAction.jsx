import React from 'react'

import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Typography from '@mui/material/Typography'

import DeleteIcon from '@mui/icons-material/Delete'
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'
import VideoCallIcon from '@mui/icons-material/VideoCall'

import md5 from 'md5'

import Media from './App.ComponentPure.Media'

import { Context as ContextApp } from './App'

import { Fetch } from './utils.fetch'
import { encryptBlob } from '../../common/crypto-web.js'

function App(props) {
  const _id = props._id
  const value = props.value
  const onChange = props.onChange
  const onChangeAppend = props.onChangeAppend

  const contextApp = React.useContext(ContextApp)

  const getFileType = (url) => {
    if (!url) return 'image'
    
    const lowerUrl = url.toLowerCase()

    // Check for video formats
    if (
      lowerUrl.includes('.mp4') ||
      lowerUrl.includes('.webm') ||
      lowerUrl.includes('.mov') ||
      lowerUrl.includes('.avi')
    ) {
      return 'video'
    }

    // Check for image formats
    if (
      lowerUrl.includes('.jpg') ||
      lowerUrl.includes('.jpeg') ||
      lowerUrl.includes('.png') ||
      lowerUrl.includes('.gif') ||
      lowerUrl.includes('.bmp') ||
      lowerUrl.includes('.webp') ||
      lowerUrl.includes('.svg')
    ) {
      return 'image'
    }

    // Default to image if format is unknown
    return 'image'
  }

  const onAppend = async (e) => {
    contextApp.loadingArrayAction.add('Upload')

    for (const file of e.target.files) {
      const encryptedBlob = await encryptBlob(file)
      const ext = file.type.split('/')[1]

      const formData = new FormData()
      formData.append('file', encryptedBlob, `${md5(file.name)}.${ext}.enc`)
      formData.append('dir', `/album/${_id}/${md5(file.name)}.${ext}.enc`)

      const res = await Fetch.form('/api/app/upload', formData)
      const link = 'kapi://remote.oss' + res.data

      onChangeAppend(link)
    }

    contextApp.loadingArrayAction.remove('Upload')
  }

  const onDelete = i => {
    onChange(value.filter((n) => n !== i))
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, width: 'fit-content', margin: 'auto' }}>
      {
        value.map((i) => {
          const fileType = getFileType(i)
          const mediaMode = fileType === 'video' ? 'Video' : 'Image'

          return <Paper key={i} style={{ width: 120, minWidth: 120, maxWidth: 'calc(50% - 12px)', aspectRatio: '1 / 1', borderRadius: 8, overflow: 'hidden', flexGrow: 0, flexShrink: 0, position: 'relative' }}>
            <Media
              lazy
              cardActionArea
              src={i}
              mode={mediaMode}
              loadingSize={32}
              style={{ width: '100%', height: '100%' }}
              controls={false}
              autoPlay={false}
              muted={true}
              loop={true}
              objectFit={'cover'}
              onClick={() => contextApp.dialogsArrayAction.add('MediaView', { src: i })}
            />
            <Button variant='contained' style={{ minWidth: 'unset', padding: 4, backdropFilter: 'blur(4px)', background: 'rgba(0, 0, 0, 0.2)', position: 'absolute', top: 8, right: 8 }} onClick={() => onDelete(i)}><DeleteIcon /></Button>
          </Paper>
        })
      }
      <label style={{ width: 120, minWidth: 120, maxWidth: 'calc(50% - 12px)', aspectRatio: '1 / 1', borderRadius: 8, overflow: 'hidden', flexGrow: 0, flexShrink: 0, position: 'relative' }}>
        <input type='file' accept='image/*,video/*' multiple style={{ display: 'none' }} onChange={onAppend} />
        <Card style={{ width: '100%', height: '100%', border: '2px dashed gray', boxShadow: 'none' }}>
          <CardActionArea style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8 }} component='div'>
            <Typography variant='body2' style={{ fontSize: 12, opacity: 0.5 }}>上传图片/视频</Typography>
            <div style={{ display: 'flex', gap: 4 }}>
              <AddAPhotoIcon style={{ width: 20, height: 20, opacity: 0.5 }} />
              <VideoCallIcon style={{ width: 20, height: 20, opacity: 0.5 }} />
            </div>
          </CardActionArea>
        </Card>
      </label>
    </div>
  )
}

export default App