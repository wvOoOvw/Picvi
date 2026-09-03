import React from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import { StepName, StepDescription, StepTag, StepActor, StepPoster, StepPreview, StepSubscribeview, StepSetting } from './App.ComponentContent.ActionStep'

import { Context as ContextApp } from './App'

import { Fetch } from './utils.fetch'

function App() {
  const contextApp = React.useContext(ContextApp)

  const albumDefult = { name: '', description: '', tag: [], actor: [], poster: [], preview: [], subscribeview: [], status: 1 }

  const [album, setAlbum] = React.useState({ ...albumDefult })
  const [albumLoading, setAlbumLoading] = React.useState(false)

  const [optionTag, setOptionTag] = React.useState([])
  const [optionActor, setOptionActor] = React.useState([])

  const [step, setStep] = React.useState(0)

  const onFetchOption = async () => {
    await Fetch.json('/api/app/album/find/tag', { match: '' }).then(res => setOptionTag(res.data))
    await Fetch.json('/api/app/album/find/actor', { match: '' }).then(res => setOptionActor(res.data))
  }

  const onFetchAlbum = async () => {
    setAlbumLoading(true)

    await Fetch.json('/api/app/album/find', { album_id: contextApp.dialogsArrayAction.props('ResourceAlbumOperation')._id })
      .then(res => {
        setAlbum(res.data)
      })
      .catch(res => {
        contextApp.dialogsArrayAction.remove('ResourceAlbumOperation')
        contextApp.messageArrayAction.add('查询错误')
      })

    setAlbumLoading(false)
  }

  const onUpdate = async () => {
    contextApp.loadingArrayAction.add('ResourceAlbumOperation')

    if (contextApp.dialogsArrayAction.props('ResourceAlbumOperation') !== undefined) {
      await Fetch.json('/api/app/admin/album/update', { ...album, album_id: contextApp.dialogsArrayAction.props('ResourceAlbumOperation')._id, _id: undefined })
        .then(res => {
          contextApp.dialogsArrayAction.remove('ResourceAlbumOperation')
          contextApp.messageArrayAction.add('更新成功')
        })
        .catch(res => {
          contextApp.messageArrayAction.add(res.message || '系统异常')
        })
    }

    if (contextApp.dialogsArrayAction.props('ResourceAlbumOperation') === undefined) {
      await Fetch.json('/api/app/admin/album/insert', { ...album })
        .then(res => {
          contextApp.dialogsArrayAction.remove('ResourceAlbumOperation')
          contextApp.messageArrayAction.add('创建成功')
          setTimeout(() => {
            contextApp.dialogsArrayAction.add('ResourceAlbumOperation', { _id: res.data.insertedId })
          }, 500)
        })
        .catch(res => {
          contextApp.messageArrayAction.add(res.message || '系统异常')
        })
    }

    if (contextApp.dialogsArrayAction.props('ResourceAlbumOperation') && contextApp.dialogsArrayAction.props('ResourceAlbumOperation').onRefresh) {
      await contextApp.dialogsArrayAction.props('ResourceAlbumOperation').onRefresh()
    }

    contextApp.loadingArrayAction.remove('ResourceAlbumOperation')
  }

  const onUploadFolder = () => {
    contextApp.dialogsArrayAction.add('FolderParse', {
      _id: album._id,
      type: 'album',
      onComplete: (props) => {
        setAlbum(i => ({
          ...i,
          ...props
        }))
      }
    })
  }

  React.useEffect(() => {
    if (contextApp.dialogsArrayAction.exist('ResourceAlbumOperation')) {
      setStep(0)
      setAlbum({ ...albumDefult })
      setAlbumLoading(false)
      onFetchOption()
    }

    if (contextApp.dialogsArrayAction.props('ResourceAlbumOperation')) {
      onFetchAlbum()
    }
  }, [contextApp.dialogsArrayAction.exist('ResourceAlbumOperation')])

  React.useEffect(() => {
    if (contextApp.dialogsArrayAction.exist('ResourceAlbumOperation') && document.getElementById('step' + step)) {
      document.getElementById('step' + step).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    }
  }, [contextApp.dialogsArrayAction.exist('ResourceAlbumOperation'), step])

  const Component =
    <Dialog open={contextApp.dialogsArrayAction.exist('ResourceAlbumOperation')} onClose={() => contextApp.dialogsArrayAction.remove('ResourceAlbumOperation')} sx={{ '& .MuiDialog-paper': { width: 600, maxWidth: 'unset' } }}>
      <DialogTitle>
        <Typography color='primary' style={{ fontSize: 20 }}>
          {
            contextApp.dialogsArrayAction.props('ResourceAlbumOperation') !== undefined ? '修改图集' : null
          }
          {
            contextApp.dialogsArrayAction.props('ResourceAlbumOperation') === undefined ? '创建图集' : null
          }
        </Typography>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 12 }}>
        {
          albumLoading !== true ?
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Stepper alternativeLabel activeStep={step} style={{ overflow: 'auto', flexShrink: 0 }}>
                {
                  ['名称', '描述', '标签', '演员', '封面', '预览', '订阅内容', '设置'].map((i, index) => {
                    return <Step key={index} style={{ minWidth: 80 }} id={'step' + index}>
                      <StepLabel style={{ whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => setStep(index)}>{i}</StepLabel>
                    </Step>
                  })
                }
              </Stepper>
              {step === 0 ? <StepName value={album} setValue={setAlbum} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 1 ? <StepDescription value={album} setValue={setAlbum} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 2 ? <StepTag value={album} setValue={setAlbum} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 3 ? <StepActor value={album} setValue={setAlbum} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 4 ? <StepPoster value={album} setValue={setAlbum} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 5 ? <StepPreview value={album} setValue={setAlbum} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 6 ? <StepSubscribeview value={album} setValue={setAlbum} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 7 ? <StepSetting value={album} setValue={setAlbum} optionTag={optionTag} optionActor={optionActor} /> : null}
            </div>
            : null
        }
        {
          albumLoading === true ?
            <div style={{ width: '100%', height: 120, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress color='primary' size={32} />
            </div>
            : null
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={onUploadFolder} disabled={albumLoading}>上传文件夹</Button>
        <Button onClick={() => setStep(i => i - 1)} disabled={step === 0 || albumLoading}>上一步</Button>
        <Button onClick={() => setStep(i => i + 1)} disabled={step === 7 || albumLoading}>下一步</Button>
        <Button onClick={onUpdate} disabled={albumLoading}>确认</Button>
      </DialogActions>
    </Dialog>

  return Component
}

export default App
