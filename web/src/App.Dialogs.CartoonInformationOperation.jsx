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

  const cartoonDefult = { name: '', description: '', tag: [], actor: [], poster: [], preview: [], subscribeview: [], status: 1 }

  const [cartoon, setCartoon] = React.useState({ ...cartoonDefult })
  const [cartoonLoading, setCartoonLoading] = React.useState(false)

  const [optionTag, setOptionTag] = React.useState([])
  const [optionActor, setOptionActor] = React.useState([])

  const [step, setStep] = React.useState(0)

  const onFetchOption = async () => {
    await Fetch.json('/api/app/cartoon/find/tag', { match: '' }).then(res => setOptionTag(res.data))
    await Fetch.json('/api/app/cartoon/find/actor', { match: '' }).then(res => setOptionActor(res.data))
  }

  const onFetchCartoon = async () => {
    setCartoonLoading(true)

    await Fetch.json('/api/app/cartoon/find', { cartoon_id: contextApp.dialogsArrayAction.props('CartoonInformationOperation')._id })
      .then(res => {
        setCartoon(res.data)
      })
      .catch(res => {
        contextApp.dialogsArrayAction.remove('CartoonInformationOperation')
        contextApp.messageArrayAction.add('查询错误')
      })

    setCartoonLoading(false)
  }

  const onUpdate = async () => {
    contextApp.loadingArrayAction.add('CartoonInformationOperation')

    if (contextApp.dialogsArrayAction.props('CartoonInformationOperation') !== undefined) {
      await Fetch.json('/api/app/admin/cartoon/update', { ...cartoon, cartoon_id: contextApp.dialogsArrayAction.props('CartoonInformationOperation')._id, _id: undefined })
        .then(res => {
          contextApp.dialogsArrayAction.remove('CartoonInformationOperation')
          contextApp.messageArrayAction.add('更新成功')
        })
        .catch(res => {
          contextApp.messageArrayAction.add(res.message || '系统异常')
        })
    }

    if (contextApp.dialogsArrayAction.props('CartoonInformationOperation') === undefined) {
      await Fetch.json('/api/app/admin/cartoon/insert', { ...cartoon })
        .then(res => {
          contextApp.dialogsArrayAction.remove('CartoonInformationOperation')
          contextApp.messageArrayAction.add('创建成功')
        })
        .catch(res => {
          contextApp.messageArrayAction.add(res.message || '系统异常')
        })
    }

    if (contextApp.dialogsArrayAction.props('CartoonInformationOperation') && contextApp.dialogsArrayAction.props('CartoonInformationOperation').onRefresh) {
      await contextApp.dialogsArrayAction.props('CartoonInformationOperation').onRefresh()
    }

    contextApp.loadingArrayAction.remove('CartoonInformationOperation')
  }

  React.useEffect(() => {
    if (contextApp.dialogsArrayAction.exist('CartoonInformationOperation')) {
      setStep(0)
      setCartoon({ ...cartoonDefult })
      setCartoonLoading(false)
      onFetchOption()
    }

    if (contextApp.dialogsArrayAction.props('CartoonInformationOperation')) {
      onFetchCartoon()
    }
  }, [contextApp.dialogsArrayAction.exist('CartoonInformationOperation')])

  React.useEffect(() => {
    if (contextApp.dialogsArrayAction.exist('CartoonInformationOperation') && document.getElementById('step' + step)) {
      document.getElementById('step' + step).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    }
  }, [contextApp.dialogsArrayAction.exist('CartoonInformationOperation'), step])

  const Component =
    <Dialog open={contextApp.dialogsArrayAction.exist('CartoonInformationOperation')} onClose={() => contextApp.dialogsArrayAction.remove('CartoonInformationOperation')} sx={{ '& .MuiDialog-paper': { width: 600, maxWidth: 'unset' } }}>
      <DialogTitle>
        <Typography color='primary' style={{ fontSize: 20 }}>
          {
            contextApp.dialogsArrayAction.props('CartoonInformationOperation') !== undefined ? '修改图集' : null
          }
          {
            contextApp.dialogsArrayAction.props('CartoonInformationOperation') === undefined ? '创建图集' : null
          }
        </Typography>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 12 }}>
        {
          cartoonLoading !== true ?
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
              {step === 0 ? <StepName value={cartoon} setValue={setCartoon} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 1 ? <StepDescription value={cartoon} setValue={setCartoon} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 2 ? <StepTag value={cartoon} setValue={setCartoon} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 3 ? <StepActor value={cartoon} setValue={setCartoon} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 4 ? <StepPoster value={cartoon} setValue={setCartoon} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 5 ? <StepPreview value={cartoon} setValue={setCartoon} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 6 ? <StepSubscribeview value={cartoon} setValue={setCartoon} optionTag={optionTag} optionActor={optionActor} /> : null}
              {step === 7 ? <StepSetting value={cartoon} setValue={setCartoon} optionTag={optionTag} optionActor={optionActor} /> : null}
            </div>
            : null
        }
        {
          cartoonLoading === true ?
            <div style={{ width: '100%', height: 120, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress color='primary' size={32} />
            </div>
            : null
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setStep(i => i - 1)} disabled={step === 0 || cartoonLoading}>上一步</Button>
        <Button onClick={() => setStep(i => i + 1)} disabled={step === 7 || cartoonLoading}>下一步</Button>
        <Button onClick={onUpdate} disabled={cartoonLoading}>确认</Button>
      </DialogActions>
    </Dialog>

  return Component
}

export default App
