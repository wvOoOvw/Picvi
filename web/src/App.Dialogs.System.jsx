import React from 'react'
import * as ReactRouterDom from "react-router-dom"

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'

import SettingsIcon from '@mui/icons-material/Settings'
import SearchIcon from '@mui/icons-material/Search'
import CollectionsIcon from '@mui/icons-material/Collections'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import VideocamIcon from '@mui/icons-material/Videocam'

import { Context as ContextApp } from './App'

function CardOption(props) {
  const contextApp = React.useContext(ContextApp)

  const name = props.name
  const description = props.description
  const icon = props.icon
  const onClick = props.onClick

  const [hovered, setHovered] = React.useState(false)

  const Component =
    <Card
      sx={{ overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.06)' }}
      style={{
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : undefined,
        boxShadow: hovered ? '0 8px 16px rgba(0, 0, 0, 0.12)' : undefined
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardActionArea onClick={onClick}>
        <CardContent style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: contextApp.theme.palette.primary.main, borderRadius: 10, padding: 8, color: 'rgba(255, 255, 255, 1)', display: 'flex', flexShrink: 0, boxShadow: '0 4px 10px -4px rgba(0, 0, 0, 0.25)' }}>
            {icon}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
            <Typography variant='body2' style={{ fontSize: 15, fontWeight: 'bolder' }}>{name}</Typography>
            <Typography variant='body2' style={{ opacity: 0.5, fontSize: 12 }}>{description}</Typography>
          </div>
        </CardContent>
      </CardActionArea>
    </Card>

  return Component
}

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
    contextApp.dialogsArrayAction.remove('System').add('ResourceAlbumOperation')
  }

  const onPickCartoon = () => {
    contextApp.dialogsArrayAction.remove('System').add('ResourceCartoonOperation')
  }

  const onPickVideo = () => {
    contextApp.dialogsArrayAction.remove('System').add('ResourceVideoOperation')
  }

  const Component =
    <Dialog open={contextApp.dialogsArrayAction.exist('System')} onClose={() => contextApp.dialogsArrayAction.remove('System')} sx={{ '& .MuiDialog-paper': { width: 600, maxWidth: 'unset', borderRadius: 3, overflow: 'hidden' } }}>
      <DialogTitle sx={{ background: contextApp.theme.palette.primary.main, padding: '20px 24px' }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'rgba(255, 255, 255, 1)', letterSpacing: 1 }}>系统设置</Typography>
        <Typography sx={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', marginTop: 0.5 }}>管理权限、查询账号与发布内容</Typography>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <CardOption name='配置权限' description='开通或调整账号权限' icon={<SettingsIcon />} onClick={onPickSystemResubscription} />
        <CardOption name='查询账号' description='检索账号订阅信息' icon={<SearchIcon />} onClick={onPickSysyemResearch} />
        <CardOption name='发布图集' description='上传并发布图集资源' icon={<CollectionsIcon />} onClick={onPickAlbum} />
        <CardOption name='发布漫画' description='上传并发布漫画资源' icon={<AutoStoriesIcon />} onClick={onPickCartoon} />
        <CardOption name='发布视频' description='上传并发布视频资源' icon={<VideocamIcon />} onClick={onPickVideo} />
      </DialogContent>
      <DialogActions sx={{ padding: '12px 16px' }}>
        <Button onClick={() => contextApp.dialogsArrayAction.remove('System')} sx={{ borderRadius: 1.5, textTransform: undefined }}>关闭</Button>
      </DialogActions>
    </Dialog>

  return Component
}

export default App
