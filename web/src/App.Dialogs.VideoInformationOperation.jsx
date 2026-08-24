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

  const videoDefult = { name: '', description: '', tag: [], actor: [], poster: [], preview: [], subscribeview: [], status: 1 }

  const [video, setVideo] = React.useState({ ...videoDefult })
  const [videoLoading, setVideoLoading] = React.useState(false)

  const [optionTag, setOptionTag] = React.useState([])
  const [optionActor, setOptionActor] = React.useState([])

  const [step, setStep] = React.useState(0)

  const onFetchOption = async () => {
    await Fetch.json('/api/app/video/find/tag', { match: '' }).then(res => setOptionTag(res.data))
    await Fetch.json('/api/app/video/find/actor', { match: '' }).then(res => setOptionActor(res.data))
  }

  const onFetchVideo = async () => {
    setVideoLoading(true)

    await Fetch.json('/api/app/video/find', { video_id: contextApp.dialogsArrayAction.props('VideoInformationOperation')._id })
      .then(res => {
        setVideo(res.data)
      })
      .catch(res => {
        contextApp.dialogsArrayAction.remove('VideoInformationOperation')
        contextApp.messageArrayAction.add('查询错误')
      })

    setVideoLoading(false)
  }

  const onUpdate = async () => {
    contextApp.loadingArrayAction.add('VideoInformationOperation')

    if (contextApp.dialogsArrayAction.props('VideoInformationOperation') !== undefined) {
      await Fetch.json('/api/app/admin/video/update', { ...video, video_id: contextApp.dialogsArrayAction.props('VideoInformationOperation')._id, _id: undefined })
        .then(res => {
          contextApp.dialogsArrayAction.remove('VideoInformationOperation')
          contextApp.messageArrayAction.add('更新成功')
        })
        .catch(res => {
          contextApp.messageArrayAction.add(res.message || '系统异常')
        })
    }

    if (contextApp.dialogsArrayAction.props('VideoInformationOperation') === undefined) {
      await Fetch.json('/api/app/admin/video/insert', { ...video })
        .then(res => {
          contextApp.dialogsArrayAction.remove('VideoInformationOperation')
          contextApp.messageArrayAction.add('创建成功')
        })
        .catch(res => {
          contextApp.messageArrayAction.add(res.message || '系统异常')
        })
    }

    if (contextApp.dialogsArrayAction.props('VideoInformationOperation') && contextApp.dialogsArrayAction.props('VideoInformationOperation').onRefresh) {
      await contextApp.dialogsArrayAction.props('VideoInformationOperation').onRefresh()
    }

    contextApp.loadingArrayAction.remove('VideoInformationOperation')
  }

  React.useEffect(() => {
    if (contextApp.dialogsArrayAction.exist('VideoInformationOperation')) {
      setStep(0)
      setVideo({ ...videoDefult })
      setVideoLoading(false)
      onFetchOption()
    }

    if (contextApp.dialogsArrayAction.props('VideoInformationOperation')) {
      onFetchVideo()
    }
  }, [contextApp.dialogsArrayAction.exist('VideoInformationOperation')])

  React.useEffect(() => {
    if (contextApp.dialogsArrayAction.exist('VideoInformationOperation') && document.getElementById('step' + step)) {
      document.getElementById('step' + step).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    }
  }, [contextApp.dialogsArrayAction.exist('VideoInformationOperation'), step])

  const Component =
    <Dialog open={contextApp.dialogsArrayAction.exist('VideoInformationOperation')} onClose={() => contextApp.dialogsArrayAction.remove('VideoInformationOperation')} sx={{ '& .MuiDialog-paper': { width: 600, maxWidth: 'unset' } }}>
      <DialogTitle>
        <Typography color='primary' style={{ fontSize: 20 }}>
          {
            contextApp.dialogsArrayAction.props('VideoInformationOperation') !== undefined ? '修改视频' : null
          }
          {
            contextApp.dialogsArrayAction.props('VideoInformationOperation') === undefined ? '创建视频' : null
          }
        </Typography>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 12 }}>
        {
          videoLoading !== true ?
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
              {step === 0 ? <StepName value={video} setValue={setVideo} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 1 ? <StepDescription value={video} setValue={setVideo} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 2 ? <StepTag value={video} setValue={setVideo} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 3 ? <StepActor value={video} setValue={setVideo} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 4 ? <StepPoster value={video} setValue={setVideo} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 5 ? <StepPreview value={video} setValue={setVideo} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 6 ? <StepSubscribeview value={video} setValue={setVideo} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 7 ? <StepSetting value={video} setValue={setVideo} optionTag={optionTag} optionActor={optionActor} /> : null}
            </div>
            : null
        }
        {
          videoLoading === true ?
            <div style={{ width: '100%', height: 120, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress color='primary' size={32} />
            </div>
            : null
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setStep(i => i - 1)} disabled={step === 0 || videoLoading}>上一步</Button>
        <Button onClick={() => setStep(i => i + 1)} disabled={step === 7 || videoLoading}>下一步</Button>
        <Button onClick={onUpdate} disabled={videoLoading}>确认</Button>
      </DialogActions>
    </Dialog>

  return Component
}

export default App
