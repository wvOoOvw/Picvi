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
import Button from '@mui/material/Button'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Chip from '@mui/material/Chip'

import { Context as ContextApp } from './App'

import { copy } from './utils.copy'

import { subscription } from '../../common/subscription'

import ContactQQ_1 from '../static/image/ContactQQ_1.jpg'
import ContactWXMP_1 from '../static/image/ContactWXMP_1.jpg'

function CardGroupCash(props) {
  const name = props.name
  const price = props.price
  const description = props.description
  const onClick = props.onClick

  const [hovered, setHovered] = React.useState(false)

  const Component =
    <Card
      style={{
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : undefined,
        boxShadow: hovered ? '0 8px 16px rgba(0, 0, 0, 0.12)' : undefined
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardActionArea onClick={onClick}>
        <CardContent style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='body2' style={{ fontSize: 16, fontWeight: 'bolder' }}>
              {name}
            </Typography>
            <Typography variant='body2' color='primary' style={{ fontWeight: 'bolder' }}>
              {price}
            </Typography>
          </div>
          <div>
            <Typography variant='body2' style={{ opacity: 0.5, fontSize: 12 }}>{description}</Typography>
          </div>
        </CardContent>
      </CardActionArea>
    </Card>

  return Component
}

function CardCurrentSubscription() {
  const contextApp = React.useContext(ContextApp)

  const subscriptionPlan = subscription.find(plan => plan.value === contextApp.user.subscription)

  const isExpired = contextApp.user.subscriptionExpireTime && new Date(contextApp.user.subscriptionExpireTime) < new Date()

  const Component =
    <Card>
      <div style={{ background: contextApp.theme.palette.primary.main, padding: '20px 24px', color: 'rgba(255, 255, 255, 1)', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 16, right: 16 }}>
          {
            isExpired === true ? <Button size='small' sx={{ color: 'rgba(255, 255, 255, 1)', border: '1px solid rgba(255, 255, 255, 0.5)' }}>已过期</Button> : null
          }
          {
            isExpired !== true ? <Button size='small' sx={{ color: 'rgba(255, 255, 255, 1)', border: '1px solid rgba(255, 255, 255, 0.5)' }}>生效中</Button> : null
          }
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography variant='body2' style={{ fontSize: 24, fontWeight: 'bolder' }}>{subscriptionPlan.name}</Typography>
          <Typography variant='body2' style={{ fontSize: 12 }}>{subscriptionPlan.description}</Typography>
        </div>
      </div>
      <CardContent style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='body2' style={{ fontSize: 14, opacity: 0.5 }}>到期时间</Typography>
          <Typography variant='body2' style={{ fontSize: 14, fontWeight: 'bolder' }}>
            {
              isExpired === true ? '您的订阅已过期，请重新订阅' : null
            }
            {
              isExpired !== true ?
                <>
                  {
                    contextApp.user.subscriptionExpireTime === 0 ? '永久有效' : null
                  }
                  {
                    contextApp.user.subscriptionExpireTime !== 0 ?
                      <>
                        {
                          isExpired === true ? '（已过期）' : null
                        }
                        {
                          isExpired !== true ? `${new Date(contextApp.user.subscriptionExpireTime).toLocaleDateString()}` : null
                        }
                      </>
                      : null
                  }
                </>
                : null
            }
          </Typography>
        </div>
      </CardContent>
    </Card>

  return Component
}

function CardContactCash() {
  const contextApp = React.useContext(ContextApp)

  const [contactView, setContactView] = React.useState('qq')

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
    <Card sx={{ overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
      <div style={{ background: contextApp.theme.palette.primary.main, padding: '20px 24px', color: 'rgba(255, 255, 255, 1)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <Typography variant='body1' style={{ fontWeight: 'bolder', fontSize: 18 }}>复制账号ID · 联系客服订阅</Typography>

          <Button
            variant='outlined'
            style={{
              fontSize: 12,
              fontWeight: 'bolder',
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.45)',
              borderRadius: 8,
              textTransform: 'none',
              padding: '6px 12px',
            }}
            sx={{
              '&:hover': { borderColor: 'rgba(255, 255, 255, 0.85)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
            onClick={() => onCopy(contextApp.user._id)}
          >{contextApp.user._id}</Button>

        </div>

      </div>
      <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: 24 }}>
        <ToggleButtonGroup
          exclusive
          value={contactView}
          onChange={(e, v) => setContactView(v)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': { borderRadius: '8px !important', border: '1px solid rgba(0, 0, 0, 0.1)', px: 2.5, fontWeight: 'bolder' },
            '& .Mui-selected': { background: `${contextApp.theme.palette.primary.main} !important`, color: 'rgba(255, 255, 255, 1) !important', borderColor: 'transparent !important' },
          }}
        >
          <ToggleButton value='qq'>QQ 客服</ToggleButton>
          <ToggleButton value='wxmp'>公众号</ToggleButton>
        </ToggleButtonGroup>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {
            contactView === 'qq' ? <img src={ContactQQ_1} style={{ width: '100%', maxWidth: 320, borderRadius: 12, boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.18)' }} /> : null
          }
          {
            contactView === 'wxmp' ? <img src={ContactWXMP_1} style={{ width: '100%', maxWidth: 320, borderRadius: 12, boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.18)' }} /> : null
          }
        </div>
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
    <Dialog open={contextApp.dialogsArrayAction.exist('Subscribe')} onClose={() => contextApp.dialogsArrayAction.remove('Subscribe')} sx={{ '& .MuiDialog-paper': { width: 600, maxWidth: 'unset', borderRadius: 3, overflow: 'hidden' } }}>
      <DialogTitle sx={{ background: contextApp.theme.palette.primary.main, padding: '20px 24px' }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'rgba(255, 255, 255, 1)', letterSpacing: 1 }}>会员订阅</Typography>
        <Typography sx={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', marginTop: 0.5 }}>解锁更多专属权益</Typography>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Stepper alternativeLabel activeStep={step} style={{ overflow: 'auto', flexShrink: 0 }}>
          <Step style={{ minWidth: 80 }} id='step0'>
            <StepLabel style={{ whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => step > 0 ? setStep(0) : undefined}>当前订阅</StepLabel>
          </Step>
          <Step style={{ minWidth: 80 }} id='step1'>
            <StepLabel style={{ whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => step > 1 ? setStep(1) : undefined}>选择套餐</StepLabel>
          </Step>
          <Step style={{ minWidth: 80 }} id='step2'>
            <StepLabel style={{ whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => step > 2 ? setStep(2) : undefined}>联系客服</StepLabel>
          </Step>
        </Stepper>
        <div style={{ width: '100%', margin: 'auto' }}>
          {
            step === 0 ?
              <>
                <CardCurrentSubscription />
                <Button
                  variant='contained'
                  color='primary'
                  style={{ width: '100%', marginTop: 16, borderRadius: 8, padding: '10px 0', fontSize: 14, fontWeight: 'bolder', background: contextApp.theme.palette.primary.main, boxShadow: '0 2px 8px -2px rgba(218, 122, 133, 0.3)', }}
                  sx={{ '&:hover': { boxShadow: '0 4px 10px -2px rgba(218, 122, 133, 0.35)' } }}
                  onClick={() => setStep(1)}>选择订阅套餐</Button>
              </>
              : null
          }
          {
            step === 1 ?
              <>
                {
                  subscription.filter(i => i.noSale !== true).map((i, index) => {
                    return <div key={index} style={{ marginBottom: 12 }}>
                      <CardGroupCash name={i.name} price={i.price} description={i.description} onClick={() => { setSelectedOption(i); setStep(2); }} />
                    </div>
                  })
                }
              </>
              : null
          }
          {
            step === 2 ?
              <>
                {
                  selectedOption ?
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <CardGroupCash name={selectedOption.name} price={selectedOption.price} description={selectedOption.description} selected={true} />
                      <CardContactCash />
                    </div>
                    : null
                }
              </>
              : null
          }
        </div>
      </DialogContent>
      <DialogActions sx={{ padding: '12px 16px' }}>
        <Button onClick={() => contextApp.dialogsArrayAction.remove('Subscribe')} sx={{ borderRadius: 1.5, textTransform: undefined }}>关闭</Button>
      </DialogActions>
    </Dialog >

  return Component
}

export default App
