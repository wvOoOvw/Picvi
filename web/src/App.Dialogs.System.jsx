import React from 'react'
import * as ReactRouterDom from "react-router-dom"

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import SettingsIcon from '@mui/icons-material/Settings'
import CameraAltIcon from '@mui/icons-material/CameraAlt'

import { Context as ContextApp } from './App'

function App() {
  const navigate = ReactRouterDom.useNavigate()

  const contextApp = React.useContext(ContextApp)

  const onPickSystemResubscription = () => {
    contextApp.dialogsArrayAction.remove('System')
    navigate('/systemresubscription')
  }

  const onPickSysyemResearch = () => {
    contextApp.dialogsArrayAction.remove('System')
    navigate('/systemresearch')
  }

  const onPickAlbum = () => {
    contextApp.dialogsArrayAction.remove('PublishPick').add('AlbumInformationOperation')
  }

  const onPickCartoon = () => {
    contextApp.dialogsArrayAction.remove('PublishPick').add('CartoonInformationOperation')
  }

  const Component =
    <Dialog open={contextApp.dialogsArrayAction.exist('System')} onClose={() => contextApp.dialogsArrayAction.remove('System')} sx={{ '& .MuiDialog-paper': { width: 600, maxWidth: 'unset' } }}>
      <DialogTitle>
        <Typography color='primary' style={{ fontSize: 20 }}>系统设置</Typography>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 4, display: 'flex', justifyContent: 'center', gap: 12 }}>
        <Button variant='contained' onClick={onPickSystemResubscription}><SettingsIcon style={{ marginRight: 4 }} />配置权限</Button>
        <Button variant='contained' onClick={onPickSysyemResearch}><SettingsIcon style={{ marginRight: 4 }} />查询账号</Button>
        <Button variant='contained' onClick={onPickAlbum}><CameraAltIcon style={{ marginRight: 4 }} />发布图集</Button>
        <Button variant='contained' onClick={onPickCartoon}><CameraAltIcon style={{ marginRight: 4 }} />发布漫画</Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => contextApp.dialogsArrayAction.remove('System')}>取消</Button>
      </DialogActions>
    </Dialog>

  return Component
}

export default App