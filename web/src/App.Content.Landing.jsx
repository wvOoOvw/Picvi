import React from 'react'
import * as ReactRouterDom from "react-router-dom"

import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'

import ImageIcon from '@mui/icons-material/Image'
import BookIcon from '@mui/icons-material/Book'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import PersonIcon from '@mui/icons-material/Person'
import LoginIcon from '@mui/icons-material/Login'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import { Media } from './App.ComponentPure.Media'

import { Context as ContextApp } from './App'

import Landing from '../static/image/Landing.webp'

function EntryCard(props) {
  const { iconComponent, title, subtitle, onClick } = props

  const contextApp = React.useContext(ContextApp)

  const [hovered, setHovered] = React.useState(false)

  return (
    <Paper
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        borderRadius: 16,
        padding: '20px 24px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        border: '1px solid rgba(0, 0, 0, 0.06)',
        background: 'white',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', background: contextApp.theme.palette.primary.main, flexShrink: 0 }}>
        {
          iconComponent
        }
      </div>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <Typography style={{ fontSize: 18, fontWeight: 'bolder' }}>{title}</Typography>
        <Typography style={{ fontSize: 12, opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</Typography>
      </div>
      <ArrowForwardIcon style={{ width: 20, height: 20, color: 'rgba(218, 122, 133, 1)', opacity: hovered ? 1 : 0.3, transition: 'opacity 0.3s ease', flexShrink: 0 }} />
    </Paper>
  )
}

function App() {
  const navigate = ReactRouterDom.useNavigate()

  const contextApp = React.useContext(ContextApp)

  const onAlbum = () => {
    navigate(`/album`)
  }

  const onCartoon = () => {
    navigate(`/cartoon`)
  }

  const onVideo = () => {
    navigate(`/video`)
  }

  const onUser = () => {
    navigate('/user')
  }

  const onLogin = () => {
    contextApp.dialogsArrayAction.add('UserLogin')
  }

  const Component =
    <>
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 880 }}>

          <div style={{ width: '100%', maxHeight: 320, aspectRatio: '5 / 3', position: 'relative' }}>
            <Media
              src={Landing}
              objectFit='cover'
              loadingSize={32}
              style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, borderRadius: '0px 0px 24px 24px', overflow: 'hidden' }}
            />
            <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', borderRadius: '0px 0px 24px 24px', background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 60%, rgba(218,122,133,0.25) 100%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
              <Typography style={{ fontSize: 40, color: 'white', fontWeight: 'bolder', letterSpacing: '2px', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>Picvi</Typography>
              <Typography style={{ fontSize: 14, color: 'white', letterSpacing: '2px', opacity: 0.9, textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>探索精选图集 · 漫画 · 视频</Typography>
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20, padding: 24 }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Typography color='primary' style={{ fontSize: 20 }}>浏览内容</Typography>
              <Divider />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <EntryCard
                iconComponent={<ImageIcon style={{ width: 24, height: 24, color: 'white' }} />}
                title='图集'
                subtitle='发现精彩图集内容'
                onClick={onAlbum}
              />
              <EntryCard
                iconComponent={<BookIcon style={{ width: 24, height: 24, color: 'white' }} />}
                title='漫画'
                subtitle='阅读精选漫画作品'
                onClick={onCartoon}
              />
              <EntryCard
                iconComponent={<VideoLibraryIcon style={{ width: 24, height: 24, color: 'white' }} />}
                title='视频'
                subtitle='观看优质视频内容'
                onClick={onVideo}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              <Typography color='primary' style={{ fontSize: 20 }}>我的</Typography>
              <Divider />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {
                contextApp.user !== undefined ?
                  <EntryCard
                    iconComponent={<PersonIcon style={{ width: 24, height: 24, color: 'white' }} />}
                    title='个人账号'
                    subtitle='查看收藏与账号信息'
                    onClick={onUser}
                  />
                  : null
              }
              {
                contextApp.user === undefined ?
                  <EntryCard
                    iconComponent={<LoginIcon style={{ width: 24, height: 24, color: 'white' }} />}
                    title='登录 / 注册'
                    subtitle='登录后解锁完整体验'
                    onClick={onLogin}
                  />
                  : null
              }
            </div>

          </div>
        </div>
      </div>
    </>

  return Component
}

export default App
