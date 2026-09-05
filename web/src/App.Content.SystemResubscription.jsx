import React from 'react'
import * as ReactRouterDom from "react-router-dom"

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

import CloseIcon from '@mui/icons-material/Close'

import dayjs from 'dayjs'

import { Context as ContextApp } from './App'

import { Fetch } from './utils.fetch'

import { subscription } from '../../common/subscription.js'

const subscriptionOptions = subscription.map(i => {
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

  const onSearch = async () => {
    contextApp.loadingArrayAction.add('SystemResubscription')

    await Fetch.json('/api/app/admin/user/find', { user_id: userId || undefined, credential: credential || undefined })
      .then(res => {
        setUserAccess(res.data.subscription)
        setUserAccessExpireTime(res.data.subscriptionExpireTime)
        setUserAccessEdit()
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
    const accessExpireTimeDayJS = subscriptionOptions.find(i => i.value === userAccessEdit)._.accessExpireTimeDayJS
    const subscriptionExpireTime =  dayjs().add(accessExpireTimeDayJS[0], accessExpireTimeDayJS[1]).valueOf()

    await Fetch.json('/api/app/admin/user/update/subscription', { user_id: userId || undefined, credential: credential || undefined, subscription: subscription, subscriptionExpireTime: subscriptionExpireTime })
      .then(res => {
        setUserAccess()
        setUserAccessExpireTime()
        setUserAccessEdit()
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
                <TextField required fullWidth autoComplete='off' label='ID' variant='outlined' value={userId} onChange={e => { setUserId(e.target.value); setCredential(''); setUserAccess(); setUserAccessExpireTime(); setUserAccessEdit(); }} disabled={credential !== ''} />
                <TextField required fullWidth autoComplete='off' label='账号' variant='outlined' value={credential} onChange={e => { setUserId(''); setCredential(e.target.value); setUserAccess(); setUserAccessExpireTime(); setUserAccessEdit(); }} disabled={userId !== ''} />
                {
                  userAccess !== undefined ?
                    <>
                      <TextField fullWidth label='权限' variant='outlined' value={subscription.find(i => i.value === userAccess)?.name || userAccess} disabled />
                      <TextField fullWidth label='过期时间' variant='outlined' value={userAccessExpireTime ? new Date(userAccessExpireTime).toLocaleDateString() : '永久有效'} disabled />

                      <FormControl fullWidth>
                        <InputLabel>套餐</InputLabel>
                        <Select color='primary' variant='outlined' label='套餐' value={userAccessEdit} onChange={e => setUserAccessEdit(e.target.value)}>
                          {
                            subscriptionOptions.filter(i => i._.noSale !== true).map(i => {
                              return <MenuItem key={i.value} value={i.value}>{i.label} {i._.results?.subscriptionExpireTimeAdd}</MenuItem>
                            })
                          }
                        </Select>
                      </FormControl>
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