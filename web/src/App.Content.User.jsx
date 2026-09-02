import React from 'react'
import ReactDOM from 'react-dom'
import * as ReactRouterDom from "react-router-dom"
import * as ReactActivation from "react-activation"

import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Fab from '@mui/material/Fab'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'

import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import EditIcon from '@mui/icons-material/Edit'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import CopyAllIcon from '@mui/icons-material/CopyAll'
import GradeIcon from '@mui/icons-material/Grade'

import { Media } from './App.ComponentPure.Media'
import { Resize } from './App.ComponentHookPure.Resize'
import { useScroll } from './App.ComponentHookPure.Scroll'
import { useActivation } from './App.ComponentHookPure.Activation'

import { PosterCardMasonry } from './App.ComponentContent.PosterCardMasonry'

import { Context as ContextApp } from './App'

import { Fetch } from './utils.fetch'
import { copy } from './utils.copy'

import AvatarEmpty from '../static/image/AvatarEmpty.jpg'
import LandingWebp from '../static/image/Landing.webp'

import { subscription } from '../../common/subscription.js'

function TabVideo(props) {
  const filter = props.filter

  const navigate = ReactRouterDom.useNavigate()

  const contextApp = React.useContext(ContextApp)

  const [video, setVideo] = React.useState([])
  const [videoLoadEnable, setVideoLoadEnable] = React.useState(true)
  const [videoLoading, setVideoLoading] = React.useState(false)

  const scrollElementRef = React.useRef()

  const onFetchVideo = async () => {
    setVideo([])
    setVideoLoadEnable(true)
    setVideoLoading(true)

    await Fetch.json('/api/app/video/find/list', { filter: { favorited: true, ...filter }, seed: 10000000000000, skip: 0, limit: 10 })
      .then(res => {
        setVideo(res.data)
        if (res.data.length !== 0) setVideoLoadEnable(true)
        if (res.data.length === 0) setVideoLoadEnable(false)
      })
      .catch(res => {
        if (contextApp.tabPage === 0) contextApp.messageArrayAction.add('检索内容失败')
      })

    setVideoLoading(false)
  }

  const onFetchVideoScroll = async () => {
    setVideoLoading(true)

    await Fetch.json('/api/app/video/find/list', { filter: { favorited: true, ...filter }, seed: 10000000000000, skip: video.length, limit: 10 })
      .then(res => {
        setVideo(i => [...i, ...res.data])
        if (res.data.length === 0) setVideoLoadEnable(false)
        if (res.data.length === 0) contextApp.messageArrayAction.add('没有更多内容')
      })
      .catch(res => {
        if (contextApp.tabPage === 0) contextApp.messageArrayAction.add('检索内容失败')
      })

    setVideoLoading(false)
  }

  React.useEffect(() => {
    if (video.length >= 10 && videoLoadEnable === true && videoLoading !== true && scrollElementRef.current) {
      const observer = new IntersectionObserver(en => {
        if (en[0].intersectionRatio > 0) onFetchVideoScroll()
      })
      observer.observe(scrollElementRef.current)
      return () => observer.disconnect()
    }
  }, [video, videoLoadEnable, videoLoading])

  React.useEffect(() => { onFetchVideo() }, [filter])

  const Component =
    <div>
      {
        video.length !== 0 ?
          <Resize>
            {
              ({ size }) => {
                var breakpointCols = 0

                if (size && size.width > 0) breakpointCols = 2
                if (size && size.width > 720) breakpointCols = 3

                return <div>
                  {
                    breakpointCols ?
                      <PosterCardMasonry
                        imageProps={{ styleMediaVisible: { width: '100%' }, styleMediaInvisible: { width: '100%', aspectRatio: '1 / 1' } }}
                        breakpointCols={breakpointCols}
                        cards={video}
                        onClickCard={(card) => navigate(`/video/${card._id}`)}
                      />
                      : null
                  }
                </div>
              }
            }
          </Resize>
          : null
      }
      {
        videoLoadEnable === false && video.length === 0 ?
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 12, height: video.length === 0 ? 200 : 'fit-content' }}>
            <Typography color='primary' variant='body2' style={{ textAlign: 'center', fontSize: 12 }}>没有检索出内容</Typography>
            <Typography color='primary' variant='body2' style={{ textAlign: 'center', fontSize: 12, opacity: 0.5 }}>切换筛选条件后再试试</Typography>
          </div>
          : null
      }
      {
        videoLoading === true ?
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 12, height: video.length === 0 ? 200 : 'fit-content' }}>
            <CircularProgress color='primary' size={32} />
          </div>
          : null
      }
      {
        videoLoadEnable === true ? <div ref={el => scrollElementRef.current = el} /> : null
      }
    </div >

  return Component
}

function TabCartoon(props) {
  const filter = props.filter

  const navigate = ReactRouterDom.useNavigate()

  const contextApp = React.useContext(ContextApp)

  const [cartoon, setCartoon] = React.useState([])
  const [cartoonLoadEnable, setCartoonLoadEnable] = React.useState(true)
  const [cartoonLoading, setCartoonLoading] = React.useState(false)

  const scrollElementRef = React.useRef()

  const onFetchCartoon = async () => {
    setCartoon([])
    setCartoonLoadEnable(true)
    setCartoonLoading(true)

    await Fetch.json('/api/app/cartoon/find/list', { filter: { favorited: true, ...filter }, seed: 10000000000000, skip: 0, limit: 10 })
      .then(res => {
        setCartoon(res.data)
        if (res.data.length !== 0) setCartoonLoadEnable(true)
        if (res.data.length === 0) setCartoonLoadEnable(false)
      })
      .catch(res => {
        if (contextApp.tabPage === 0) contextApp.messageArrayAction.add('检索内容失败')
      })

    setCartoonLoading(false)
  }

  const onFetchCartoonScroll = async () => {
    setCartoonLoading(true)

    await Fetch.json('/api/app/cartoon/find/list', { filter: { favorited: true, ...filter }, seed: 10000000000000, skip: cartoon.length, limit: 10 })
      .then(res => {
        setCartoon(i => [...i, ...res.data])
        if (res.data.length === 0) setCartoonLoadEnable(false)
        if (res.data.length === 0) contextApp.messageArrayAction.add('没有更多内容')
      })
      .catch(res => {
        if (contextApp.tabPage === 0) contextApp.messageArrayAction.add('检索内容失败')
      })

    setCartoonLoading(false)
  }

  React.useEffect(() => {
    if (cartoon.length >= 10 && cartoonLoadEnable === true && cartoonLoading !== true && scrollElementRef.current) {
      const observer = new IntersectionObserver(en => {
        if (en[0].intersectionRatio > 0) onFetchCartoonScroll()
      })
      observer.observe(scrollElementRef.current)
      return () => observer.disconnect()
    }
  }, [cartoon, cartoonLoadEnable, cartoonLoading])

  React.useEffect(() => { onFetchCartoon() }, [filter])

  const Component =
    <div>
      {
        cartoon.length !== 0 ?
          <Resize>
            {
              ({ size }) => {
                var breakpointCols = 0

                if (size && size.width > 0) breakpointCols = 2
                if (size && size.width > 720) breakpointCols = 3

                return <div>
                  {
                    breakpointCols ?
                      <PosterCardMasonry
                        imageProps={{ styleMediaVisible: { width: '100%' }, styleMediaInvisible: { width: '100%', aspectRatio: '1 / 1' } }}
                        breakpointCols={breakpointCols}
                        cards={cartoon}
                        onClickCard={(card) => navigate(`/cartoon/${card._id}`)}
                      />
                      : null
                  }
                </div>
              }
            }
          </Resize>
          : null
      }
      {
        cartoonLoadEnable === false && cartoon.length === 0 ?
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 12, height: cartoon.length === 0 ? 200 : 'fit-content' }}>
            <Typography color='primary' variant='body2' style={{ textAlign: 'center', fontSize: 12 }}>没有检索出内容</Typography>
            <Typography color='primary' variant='body2' style={{ textAlign: 'center', fontSize: 12, opacity: 0.5 }}>切换筛选条件后再试试</Typography>
          </div>
          : null
      }
      {
        cartoonLoading === true ?
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 12, height: cartoon.length === 0 ? 200 : 'fit-content' }}>
            <CircularProgress color='primary' size={32} />
          </div>
          : null
      }
      {
        cartoonLoadEnable === true ? <div ref={el => scrollElementRef.current = el} /> : null
      }
    </div >

  return Component
}

function TabAlbum(props) {
  const filter = props.filter

  const navigate = ReactRouterDom.useNavigate()

  const contextApp = React.useContext(ContextApp)

  const [album, setAlbum] = React.useState([])
  const [albumLoadEnable, setAlbumLoadEnable] = React.useState(true)
  const [albumLoading, setAlbumLoading] = React.useState(false)

  const scrollElementRef = React.useRef()

  const onFetchAlbum = async () => {
    setAlbum([])
    setAlbumLoadEnable(true)
    setAlbumLoading(true)

    await Fetch.json('/api/app/album/find/list', { filter: { favorited: true, ...filter }, seed: 10000000000000, skip: 0, limit: 10 })
      .then(res => {
        setAlbum(res.data)
        if (res.data.length !== 0) setAlbumLoadEnable(true)
        if (res.data.length === 0) setAlbumLoadEnable(false)
      })
      .catch(res => {
        if (contextApp.tabPage === 0) contextApp.messageArrayAction.add('检索内容失败')
      })

    setAlbumLoading(false)
  }

  const onFetchAlbumScroll = async () => {
    setAlbumLoading(true)

    await Fetch.json('/api/app/album/find/list', { filter: { favorited: true, ...filter }, seed: 10000000000000, skip: album.length, limit: 10 })
      .then(res => {
        setAlbum(i => [...i, ...res.data])
        if (res.data.length === 0) setAlbumLoadEnable(false)
        if (res.data.length === 0) contextApp.messageArrayAction.add('没有更多内容')
      })
      .catch(res => {
        if (contextApp.tabPage === 0) contextApp.messageArrayAction.add('检索内容失败')
      })

    setAlbumLoading(false)
  }

  React.useEffect(() => {
    if (album.length >= 10 && albumLoadEnable === true && albumLoading !== true && scrollElementRef.current) {
      const observer = new IntersectionObserver(en => {
        if (en[0].intersectionRatio > 0) onFetchAlbumScroll()
      })
      observer.observe(scrollElementRef.current)
      return () => observer.disconnect()
    }
  }, [album, albumLoadEnable, albumLoading])

  React.useEffect(() => { onFetchAlbum() }, [filter])

  const Component =
    <div>

      {
        album.length !== 0 ?
          <Resize>
            {
              ({ size }) => {
                var breakpointCols = 0

                if (size && size.width > 0) breakpointCols = 2
                if (size && size.width > 720) breakpointCols = 3

                return <div>
                  {
                    breakpointCols ?
                      <PosterCardMasonry
                        imageProps={{ styleMediaVisible: { width: '100%' }, styleMediaInvisible: { width: '100%', aspectRatio: '1 / 1' } }}
                        breakpointCols={breakpointCols}
                        cards={album}
                        onClickCard={(card) => navigate(`/album/${card._id}`)}
                      />
                      : null
                  }
                </div>
              }
            }
          </Resize>
          : null
      }
      {
        albumLoadEnable === false && album.length === 0 ?
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 12, height: album.length === 0 ? 200 : 'fit-content' }}>
            <Typography color='primary' variant='body2' style={{ textAlign: 'center', fontSize: 12 }}>没有检索出内容</Typography>
            <Typography color='primary' variant='body2' style={{ textAlign: 'center', fontSize: 12, opacity: 0.5 }}>切换筛选条件后再试试</Typography>
          </div>
          : null
      }
      {
        albumLoading === true ?
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 12, height: album.length === 0 ? 200 : 'fit-content' }}>
            <CircularProgress color='primary' size={32} />
          </div>
          : null
      }
      {
        albumLoadEnable === true ? <div ref={el => scrollElementRef.current = el} /> : null
      }
    </div >

  return Component
}

function User(props) {
  const user = props.user
  const onRefresh = props.onRefresh

  const contextApp = React.useContext(ContextApp)

  const [typeMode, setTypeMode] = React.useState(0)

  const [filter, setFilter] = React.useState({ name: '' })

  const { scrollTop } = useScroll({ time: 1000 })
  const { active } = useActivation()

  const onCopy = async (text) => {
    await copy(text)
      .then(() => {
        contextApp.messageArrayAction.add('已复制到剪贴板')
      })
      .catch(() => {
        contextApp.messageArrayAction.add('复制失败')
      })
  }

  const onExit = () => {
    const onConfirm = async () => {
      localStorage.removeItem('User_Authorization')
      contextApp.setUser()
      contextApp.messageArrayAction.add('退出成功')
      contextApp.dialogsArrayAction.remove('Confirm')
    }

    contextApp.dialogsArrayAction.add('Confirm', { content: '是否确认退出当前账号', onConfirm: onConfirm })

  }

  const onEdit = () => {
    contextApp.dialogsArrayAction.add('UserOperation', { onRefresh: onRefresh })
  }

  const onSystem = () => {
    contextApp.dialogsArrayAction.add('System')
  }

  const onSubscribe = () => {
    contextApp.dialogsArrayAction.add('Subscribe')
  }

  const onScrollTop = () => {
    document.documentElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  const Component =
    <>

      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 880 }}>

          <div style={{ width: '100%', maxHeight: 300, aspectRatio: '5 / 3', position: 'relative' }}>
            <Media
              src={LandingWebp}
              objectFit='cover'
              loadingSize={32}
              style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, borderRadius: '0px 0px 16px 16px', overflow: 'hidden' }}
            />
            <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', borderRadius: '0px 0px 16px 16px', background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.2) 100%)', pointerEvents: 'none' }} />
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', padding: 24, paddingBottom: 96 }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: -44 }}>
              <Avatar style={{ width: 72, height: 72, fontSize: 28, fontWeight: 'bolder', background: contextApp.theme.palette.primary.main, color: 'rgba(255, 255, 255, 1)', border: '4px solid rgba(255, 255, 255, 1)', boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.2)' }}>{user.credential?.charAt(0)?.toUpperCase()}</Avatar>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <Typography color='primary' style={{ fontSize: 24, fontWeight: 'bolder' }}>{user.credential}</Typography>
                <Chip color='primary' style={{ fontSize: 12, color: 'white' }} label={subscription.find(i => i.value === user.subscription).name} onClick={onSubscribe}></Chip>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              <Typography color='primary' style={{ fontSize: 14 }}>ID:</Typography>
              <Typography color='primary' style={{ fontSize: 14 }}>{user._id}</Typography>
              <Button size='small' style={{ minWidth: 'unset', padding: '2px 6px' }} onClick={() => onCopy(user._id)}>
                <CopyAllIcon style={{ fontSize: 14, marginRight: 2 }} />
                <span style={{ fontSize: 12 }}>复制</span>
              </Button>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap', gap: 8, marginBottom: 4 }}>
              {
                user.subscription === 'administrator' ?
                  <Button color='primary' variant='outlined' style={{ flexFlow: 0, flexShrink: 1, minWidth: 0, borderRadius: 8, overflow: 'hidden' }} onClick={onSystem}><SettingsIcon style={{ fontSize: 16, marginRight: 4, flexShrink: 0 }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>系统设置</span></Button>
                  : null
              }
              <Button color='primary' variant='outlined' style={{ flexFlow: 0, flexShrink: 1, minWidth: 0, borderRadius: 8, overflow: 'hidden' }} onClick={onSubscribe}><GradeIcon style={{ fontSize: 16, marginRight: 4, flexShrink: 0 }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>升级订阅</span></Button>
              <Button color='primary' variant='outlined' style={{ flexFlow: 0, flexShrink: 1, minWidth: 0, borderRadius: 8, overflow: 'hidden' }} onClick={onEdit}><EditIcon style={{ fontSize: 16, marginRight: 4, flexShrink: 0 }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>修改密码</span></Button>
              <Button color='primary' variant='outlined' style={{ flexFlow: 0, flexShrink: 1, minWidth: 0, borderRadius: 8, overflow: 'hidden' }} onClick={onExit}><LogoutIcon style={{ fontSize: 16, marginRight: 4, flexShrink: 0 }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>退出账号</span></Button>
            </div>

            <div>
              <Divider />
            </div>

            <div>
              <Typography color='primary' style={{ fontSize: 16 }}>我的收藏</Typography>
            </div>

            <div>
              <Divider />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, width: '100%' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button style={{ flexShrink: 0, minWidth: 'unset', padding: '4px 8px', fontSize: 14 }} color='primary' variant={typeMode === 0 ? 'contained' : 'text'} onClick={() => setTypeMode(0)}>图集</Button>
                <Button style={{ flexShrink: 0, minWidth: 'unset', padding: '4px 8px', fontSize: 14 }} color='primary' variant={typeMode === 1 ? 'contained' : 'text'} onClick={() => setTypeMode(1)}>漫画</Button>
                <Button style={{ flexShrink: 0, minWidth: 'unset', padding: '4px 8px', fontSize: 14 }} color='primary' variant={typeMode === 2 ? 'contained' : 'text'} onClick={() => setTypeMode(2)}>视频</Button>
              </div>
              <div style={{ width: 'fit-content', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={() => setFilter({ name: '' })}><RefreshIcon style={{ width: 24, height: 24 }} /></Button>
                {
                  filter.name === '' ?
                    <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={() => contextApp.dialogsArrayAction.add('TextFilter', { text: filter.name, onConfirm: (text) => setFilter({ ...filter, name: text }) })}>
                      <SearchIcon style={{ width: 24, height: 24 }} />
                    </Button>
                    : null
                }
                {
                  filter.name !== '' ?
                    <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={() => setFilter({ ...filter, name: '' })}>
                      <SearchIcon style={{ width: 24, height: 24 }} />
                      <div style={{ maxWidth: 80, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{albumFilter.name}</div>
                    </Button>
                    : null
                }
              </div>
            </div>

            <div>
              {
                typeMode === 0 ? <TabAlbum filter={filter} /> : null
              }
              {
                typeMode === 1 ? <TabCartoon filter={filter} /> : null
              }
              {
                typeMode === 2 ? <TabVideo filter={filter} /> : null
              }
            </div>
          </div>
        </div>
      </div>

      {
        active === true ?
          ReactDOM.createPortal(
            <>
              <Fab disabled={scrollTop === 0} color='primary' style={{ position: 'fixed', bottom: 24, right: 12, width: 48, height: 48, opacity: scrollTop > 0 ? 1 : 0, transition: '0.5s all' }} onClick={onScrollTop}><ArrowUpwardIcon /></Fab>
            </>
            , document.body)
          : null
      }

    </>

  return Component
}

function App() {
  const contextApp = React.useContext(ContextApp)

  const [user, setUser] = React.useState()
  const [userLoading, setUserLoading] = React.useState(true)

  const onFetchUser = async () => {
    setUserLoading(true)

    await Fetch.json('/api/app/user/find/self')
      .then(res => {
        setUser(res.data)
      })
      .catch(res => {
        contextApp.messageArrayAction.add('检索用户内容失败')
      })

    await new Promise(resolve => setTimeout(() => resolve(), 500))

    setUserLoading(false)
  }

  const onFetchUserRefresh = async () => {
    await Fetch.json('/api/app/user/find/self')
      .then(res => {
        setUser(res.data)
      })
      .catch(res => {
        contextApp.messageArrayAction.add('检索用户内容失败')
      })
  }

  React.useEffect(() => { if (contextApp.user && contextApp.user._id) onFetchUser() }, [contextApp.user])

  ReactActivation.useActivate(() => { if (contextApp.user && contextApp.user._id) onFetchUserRefresh() })

  const Component =
    <>
      {
        userLoading !== true ?
          <>
            {
              user !== undefined && user._id === contextApp.user._id ?
                <>
                  <User user={user} onRefresh={onFetchUserRefresh} />
                </>
                : null
            }
            {
              user === undefined ?
                <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                  <Avatar src={AvatarEmpty} style={{ width: 48, height: 48 }} />
                  <Button>查询不到当前用户</Button>
                </div>
                : null
            }
          </>
          : null
      }
      {
        userLoading === true ?
          <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress color='primary' size={32} />
          </div>
          : null
      }
    </>

  return Component
}

export default App