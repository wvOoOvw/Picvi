import React from 'react'
import * as ReactRouterDom from "react-router-dom"

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import CloseIcon from '@mui/icons-material/Close'

import dayjs from 'dayjs'

import { Context as ContextApp } from './App'

import { Fetch } from './utils.fetch'

import { subscription } from '../../common/subscription.js'

const subscriptionOptions = subscription
  .filter(i => i.noResubscribe !== true)
  .map(i => {
    return {
      value: i.value,
      label: i.name,
      _: i
    }
  })

function App() {
  const navigate = ReactRouterDom.useNavigate()

  const contextApp = React.useContext(ContextApp)

  const [userId, setUserId] = React.useState('')
  const [credential, setCredential] = React.useState('')

  const [userAccess, setUserAccess] = React.useState()
  const [userAccessExpireTime, setUserAccessExpireTime] = React.useState()
  const [userAccessEdit, setUserAccessEdit] = React.useState()
  const [userAccessExpireTimeEdit, setUserAccessExpireTimeEdit] = React.useState()

  const onSearch = async () => {
    contextApp.loadingArrayAction.add('SystemResubscription')

    await Fetch.json('/api/app/admin/user/find', { user_id: userId || undefined, credential: credential || undefined })
      .then(res => {
        setUserAccess(res.data.subscription)
        setUserAccessExpireTime(res.data.subscriptionExpireTime)
        setUserAccessEdit()
        setUserAccessExpireTimeEdit()
        contextApp.messageArrayAction.add('查询成功')
      })
      .catch(res => {
        contextApp.messageArrayAction.add('查询失败')
      })

    contextApp.loadingArrayAction.remove('SystemResubscription')
  }

  const onEnsure = async () => {
    contextApp.loadingArrayAction.add('SystemResubscription')

    const subscription = subscriptionOptions.find(i => i.value === userAccessEdit)?._.value
    const accessExpireTimeDayJS = userAccessExpireTimeEdit || subscriptionOptions.find(i => i.value === userAccessEdit)._.accessExpireTimeDayJS
    const subscriptionExpireTime = dayjs().add(accessExpireTimeDayJS[0], accessExpireTimeDayJS[1]).valueOf()

    await Fetch.json('/api/app/admin/user/update/subscription', { user_id: userId || undefined, credential: credential || undefined, subscription: subscription, subscriptionExpireTime: subscriptionExpireTime })
      .then(res => {
        setUserAccess()
        setUserAccessExpireTime()
        setUserAccessEdit()
        setUserAccessExpireTimeEdit()
        onSearch()
        contextApp.messageArrayAction.add('修改成功')
      })
      .catch(res => {
        contextApp.messageArrayAction.add('修改失败')
      })

    contextApp.loadingArrayAction.remove('SystemResubscription')
  }

  const onClose = () => {
    if (document.referrer === '') navigate('/')
    if (document.referrer !== '') navigate(-1)
  }

  const Component =
    <>
      {
        contextApp.user && contextApp.user.subscription === 'administrator' ?
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 880, height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <Typography color='primary' style={{ fontSize: 28 }}>配置用户权限</Typography>
                <CloseIcon color='primary' style={{ width: 32, height: 32, cursor: 'pointer' }} onClick={onClose} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: 24, paddingTop: 32 }}>
                <TextField required fullWidth autoComplete='off' label='ID' variant='outlined' value={userId} onChange={e => { setUserId(e.target.value); setCredential(''); setUserAccess(); setUserAccessExpireTime(); setUserAccessEdit(); setUserAccessExpireTimeEdit(); }} disabled={credential !== ''} />
                <TextField required fullWidth autoComplete='off' label='账号' variant='outlined' value={credential} onChange={e => { setUserId(''); setCredential(e.target.value); setUserAccess(); setUserAccessExpireTime(); setUserAccessEdit(); setUserAccessExpireTimeEdit(); }} disabled={userId !== ''} />
                {
                  userAccess !== undefined ?
                    <>
                      <TextField fullWidth label='权限' variant='outlined' value={subscription.find(i => i.value === userAccess)?.name || userAccess} disabled />
                      <TextField fullWidth label='过期时间' variant='outlined' value={userAccessExpireTime ? new Date(userAccessExpireTime).toLocaleString() : '永久有效'} disabled />

                      <FormControl fullWidth>
                        <InputLabel shrink style={{ position: 'relative', transform: 'none', marginBottom: 16 }}>套餐</InputLabel>
                        <div style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', gap: 12 }}>
                          {
                            subscriptionOptions.filter(i => i._.noSale !== true).map(i => {
                              const isSelected = userAccessEdit === i.value
                              return (
                                <Button
                                  fullWidth
                                  key={i.value}
                                  variant={isSelected ? 'contained' : 'outlined'}
                                  onClick={() => { setUserAccessEdit(i.value); setUserAccessExpireTimeEdit(); }}
                                  sx={{
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    textTransform: 'none',
                                    px: 2,
                                    py: 1.5,
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease',
                                    ...(isSelected ? {} : { borderColor: 'divider', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } })
                                  }}
                                >
                                  <div style={{ fontWeight: 'bold' }}>{i.label}</div>
                                  <div style={{ fontSize: 12, color: isSelected ? 'rgba(255,255,255,0.7)' : 'gray' }}>{i._.description}</div>
                                </Button>
                              )
                            })
                          }
                        </div>
                      </FormControl>
                      {
                        userAccessEdit !== undefined ?
                          <FormControl fullWidth>
                            <InputLabel shrink style={{ position: 'relative', transform: 'none', marginBottom: 16 }}>增加的时间</InputLabel>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <div style={{ display: 'flex', gap: 12 }}>
                                <TextField
                                  type='number'
                                  label='数值'
                                  variant='outlined'
                                  value={userAccessExpireTimeEdit ? userAccessExpireTimeEdit[0] : subscriptionOptions.find(i => i.value === userAccessEdit)?._.accessExpireTimeDayJS[0]}
                                  onChange={e => {
                                    const num = parseInt(e.target.value) || 0
                                    const unit = userAccessExpireTimeEdit ? userAccessExpireTimeEdit[1] : subscriptionOptions.find(i => i.value === userAccessEdit)?._.accessExpireTimeDayJS[1]
                                    setUserAccessExpireTimeEdit([num, unit])
                                  }}
                                  sx={{ flex: 1 }}
                                  inputProps={{ min: 0 }}
                                />
                                <Select
                                  value={userAccessExpireTimeEdit ? userAccessExpireTimeEdit[1] : subscriptionOptions.find(i => i.value === userAccessEdit)?._.accessExpireTimeDayJS[1]}
                                  onChange={e => {
                                    const num = userAccessExpireTimeEdit ? userAccessExpireTimeEdit[0] : subscriptionOptions.find(i => i.value === userAccessEdit)?._.accessExpireTimeDayJS[0]
                                    setUserAccessExpireTimeEdit([num, e.target.value])
                                  }}
                                  sx={{ flex: 1 }}
                                >
                                  <MenuItem value='minute'>分钟</MenuItem>
                                  <MenuItem value='hour'>小时</MenuItem>
                                  <MenuItem value='day'>天</MenuItem>
                                  <MenuItem value='month'>月</MenuItem>
                                  <MenuItem value='year'>年</MenuItem>
                                </Select>
                              </div>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <Button variant='outlined' size='large' onClick={() => setUserAccessExpireTimeEdit([1, 'year'])}>1年</Button>
                                <Button variant='outlined' size='large' onClick={() => setUserAccessExpireTimeEdit([1000, 'year'])}>永久</Button>
                              </div>
                            </div>
                          </FormControl>
                          : null
                      }
                    </>
                    : null
                }
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                  <Button variant='contained' size='large' onClick={onSearch} disabled={userId === '' && credential === ''}>查询</Button>
                  <Button variant='contained' size='large' onClick={onEnsure} disabled={userAccess === undefined}>修改</Button>
                </div>
              </div>
            </div>
          </div>
          : null
      }
    </>

  return Component
}

export default App