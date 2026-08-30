import React from 'react'
import * as ReactRouterDom from "react-router-dom"

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import CloseIcon from '@mui/icons-material/Close'

import dayjs from 'dayjs'

import { Context as ContextApp } from './App'

import { Fetch } from './utils.fetch'

import { subscription } from '../../common/subscription.js'

const subscriptionOptions = subscription.map(i => {
  return {
    value: i.value,
    label: i.name,
  }
})

function App() {
  const navigate = ReactRouterDom.useNavigate()

  const contextApp = React.useContext(ContextApp)

  const [userId, setUserId] = React.useState('')
  const [credential, setCredential] = React.useState('')

  const [userAccess, setUserAccess] = React.useState()
  const [userAccessExpireTime, setUserAccessExpireTime] = React.useState()

  const onSearch = async () => {
    contextApp.loadingArrayAction.add('SystemResubscription')

    await Fetch.json('/api/app/user/admin/find', { user_id: userId || undefined, credential: credential || undefined })
      .then(res => {
        setUserAccess(res.data.subscription)
        setUserAccessExpireTime(res.data.subscriptionExpireTime ? dayjs(res.data.subscriptionExpireTime) : null)
        contextApp.messageArrayAction.add('查询成功')
      })
      .catch(res => {
        contextApp.messageArrayAction.add('查询失败')
      })

    contextApp.loadingArrayAction.remove('SystemResubscription')
  }

  const onEnsure = async () => {
    contextApp.loadingArrayAction.add('SystemResubscription')

    await Fetch.json('/api/app/admin/user/update/subscription', { user_id: userId || undefined, credential: credential || undefined, subscription: userAccess, subscriptionExpireTime: userAccessExpireTime ? userAccessExpireTime.valueOf() : undefined })
      .then(res => {
        setUserAccess()
        setUserAccessExpireTime()
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
                <TextField required fullWidth autoComplete='off' label='ID' variant='outlined' value={userId} onChange={e => { setUserId(e.target.value); setCredential(''); setUserAccess(); setUserAccessExpireTime(); }} disabled={credential !== ''} />
                <TextField required fullWidth autoComplete='off' label='账号' variant='outlined' value={credential} onChange={e => { setUserId(''); setCredential(e.target.value); setUserAccess(); setUserAccessExpireTime(); }} disabled={userId !== ''} />
                {
                  userAccess !== undefined ?
                    <>
                      <FormControl fullWidth size='small' variant='standard'>
                        <InputLabel>权限</InputLabel>
                        <Select color='primary' variant='standard' size='small' label='权限' value={userAccess} onChange={e => setUserAccess(e.target.value)}>
                          {
                            subscriptionOptions.map(i => {
                              return <MenuItem key={i.value} value={i.value}>{i.label}</MenuItem>
                            })
                          }
                        </Select>
                      </FormControl>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker label='过期时间' value={userAccessExpireTime} onChange={setUserAccessExpireTime}
                        />
                      </LocalizationProvider>
                    </>
                    : null
                }
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                  <Button variant='contained' onClick={onSearch} disabled={userId === '' && credential === ''}>查询</Button>
                  <Button variant='contained' onClick={onEnsure} disabled={userAccess === undefined}>修改</Button>
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