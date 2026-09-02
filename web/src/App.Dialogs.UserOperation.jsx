import React from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import { Context as ContextApp } from './App'

import { Fetch } from './utils.fetch'

function App() {
  const contextApp = React.useContext(ContextApp)

  const [user, setUser] = React.useState()
  const [userLoading, setUserLoading] = React.useState(false)

  const onFetchUser = async () => {
    setUserLoading(true)

    await Fetch.json('/api/app/user/find/self')
      .then(res => {
        setUser({ password: res.data.password })
      })
      .catch(res => {
        contextApp.dialogsArrayAction.remove('UserOperation')
        contextApp.messageArrayAction.add('查询错误')
      })

    setUserLoading(false)
  }

  const onEnsure = async () => {
    contextApp.loadingArrayAction.add('UserOperation')

    await Fetch.json('/api/app/user/update', { ...user })
      .then(res => {
        localStorage.setItem('User_Authorization', res.data.authorization)
        Fetch.connect(res.data.authorization)
        contextApp.setUser(res.data)
        contextApp.messageArrayAction.add('编辑成功')
        contextApp.dialogsArrayAction.remove('UserOperation')
      })
      .catch(res => {
        contextApp.messageArrayAction.add(res.message || '异常错误')
      })

    if (contextApp.dialogsArrayAction.props('UserOperation') && contextApp.dialogsArrayAction.props('UserOperation').onRefresh) {
      await contextApp.dialogsArrayAction.props('UserOperation').onRefresh()
    }

    contextApp.loadingArrayAction.remove('UserOperation')
  }

  React.useEffect(() => {
    if (contextApp.dialogsArrayAction.exist('UserOperation')) {
      setUser()
      setUserLoading(false)
      onFetchUser()
    }
  }, [contextApp.dialogsArrayAction.exist('UserOperation')])

  const Component =
    <Dialog open={contextApp.dialogsArrayAction.exist('UserOperation')} onClose={() => contextApp.dialogsArrayAction.remove('UserOperation')} sx={{ '& .MuiDialog-paper': { width: 600, maxWidth: 'unset' } }}>
      <DialogTitle>
        <Typography color='primary' style={{ fontSize: 20 }}>
          修改密码
        </Typography>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 12 }}>
        {
          userLoading !== true && user ?
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <TextField fullWidth size='small' label='新密码' variant='outlined' color='primary' value={user.password} onChange={e => setUser({ ...user, password: e.target.value })} />
            </div>
            : null
        }
        {
          userLoading === true ?
            <div style={{ width: '100%', height: 120, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress color='primary' size={32} />
            </div>
            : null
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={() => contextApp.dialogsArrayAction.remove('UserOperation')}>取消</Button>
        <Button onClick={onEnsure}>确认修改</Button>
      </DialogActions>
    </Dialog>

  return Component
}

export default App
