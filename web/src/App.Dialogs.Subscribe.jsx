import React from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'

import { Context as ContextApp } from './App'

import { copy } from './utils.copy'

import { subscription } from '../../common/subscription'

import ContactQQ_2 from '../static/image/ContactQQ_2.jpg'
import ContactWXMP_1 from '../static/image/ContactWXMP_1.jpg'

function CardGroupCash(props) {
  const name = props.name
  const price = props.price
  const description = props.description
  const onClick = props.onClick

  const Component =
    <Card>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Typography variant='body2' style={{ fontSize: 16 }}>{name}</Typography>
            <Typography variant='body2'>
              <span style={{ opacity: 0.5 }}>{price}</span>
            </Typography>
          </div>
          <div>
            <Typography variant='body2'>
              <span style={{ opacity: 0.5, fontSize: 12 }}>{description}</span>
            </Typography>
          </div>
        </CardContent>
      </CardActionArea>
    </Card>

  return Component
}

function CardContactCash() {
  const contextApp = React.useContext(ContextApp)

  const onCopy = async (text) => {
    await copy(text)
      .then(() => {
        contextApp.messageArrayAction.add('已复制到剪贴板')
      })
      .catch(() => {
        contextApp.messageArrayAction.add('复制失败')
      })
  }

  const Component =
    <Card>
      <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Typography variant='body1' style={{ textAlign: 'center' }}>联系客服兑换</Typography>
        <Divider style={{ width: '100%' }} />
        <Typography variant='body2' style={{ textAlign: 'center' }}>将ID发给下方QQ客服（点击复制）</Typography>
        <Button variant='outlined' color='primary' size='small' style={{ fontSize: 12 }} onClick={() => onCopy(contextApp.user._id)}>ID {contextApp.user._id}</Button>
        <Divider style={{ width: '100%' }} />
        <img src={ContactQQ_2} style={{ width: '100%' }} />
        <img src={ContactWXMP_1} style={{ width: '100%' }} />
        <Divider style={{ width: '100%' }} />
        <Typography variant='body2' style={{ textAlign: 'center', fontSize: 12 }}>添加不上时，关注下方公众号，私信留下QQ号或微信号！</Typography>
      </CardContent>
    </Card>

  return Component
}

function App() {
  const contextApp = React.useContext(ContextApp)

  const [step, setStep] = React.useState(0)

  const [selectedOption, setSelectedOption] = React.useState()

  React.useEffect(() => {
    if (contextApp.dialogsArrayAction.exist('Subscribe')) {
      setStep(0)
      setSelectedOption()
    }
    if (contextApp.dialogsArrayAction.exist('Subscribe') && contextApp.user === undefined) {
      contextApp.dialogsArrayAction.remove('Subscribe').add('UserLogin')
      contextApp.messageArrayAction.add('请先登录')
    }
  }, [contextApp.dialogsArrayAction.exist('Subscribe'), contextApp.user])

  React.useEffect(() => {
    if (contextApp.dialogsArrayAction.exist('Subscribe') && step && document.getElementById('step' + step)) {
      document.getElementById('step' + step).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    }
  }, [contextApp.dialogsArrayAction.exist('Subscribe'), step])

  const Component =
    <Dialog open={contextApp.dialogsArrayAction.exist('Subscribe')} onClose={() => contextApp.dialogsArrayAction.remove('Subscribe')} sx={{ '& .MuiDialog-paper': { width: 600, maxWidth: 'unset' } }}>
      <DialogTitle>
        <Typography color='primary' style={{ fontSize: 20 }}>会员订阅</Typography>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Stepper alternativeLabel activeStep={step} style={{ overflow: 'auto', flexShrink: 0 }}>
          <Step style={{ minWidth: 80 }} id='step0'>
            <StepLabel style={{ whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => step > 0 ? setStep(0) : undefined}>选择订阅套餐</StepLabel>
          </Step>
          <Step style={{ minWidth: 80 }} id='step1'>
            <StepLabel style={{ whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => step > 1 ? setStep(1) : undefined}>联系客服</StepLabel>
          </Step>
        </Stepper>
        <div style={{ width: '100%', maxWidth: 320, margin: 'auto' }}>
          {
            step === 0 ?
              <>
                {
                  subscription.filter(i => i.noSale !== true).map((i, index) => {
                    return <CardGroupCash key={index} name={i.name} price={i.price} description={i.description} onClick={() => { setSelectedOption(i); setStep(1); }} />
                  })
                }
              </>
              : null
          }
          {
            step === 1 ?
              <>
                {
                  selectedOption ?
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <CardGroupCash name={selectedOption.name} price={selectedOption.price} description={selectedOption.description} />
                      <CardContactCash />
                    </div>
                    : null
                }
              </>
              : null
          }
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => contextApp.dialogsArrayAction.remove('Subscribe')}>关闭</Button>
      </DialogActions>
    </Dialog >

  return Component
}

export default App