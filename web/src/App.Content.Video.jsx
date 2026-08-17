import React from 'react'
import ReactDOM from 'react-dom'
import * as ReactRouterDom from "react-router-dom"

import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Fab from '@mui/material/Fab'

import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

import { useScroll } from './App.ComponentHookPure.Scroll'
import { useActivation } from './App.ComponentHookPure.Activation'
import { Resize } from './App.ComponentHookPure.Resize'

import { Context as ContextApp } from './App'

import { Fetch } from './utils.fetch'

import PosterCardMasonry from './App.ComponentContent.PosterCardMasonry'

function App() {
  const navigate = ReactRouterDom.useNavigate()

  const contextApp = React.useContext(ContextApp)

  const [videoSeed, setVideoSeed] = React.useState(1)
  const [video, setVideo] = React.useState([])
  const [videoLoadEnable, setVideoLoadEnable] = React.useState()
  const [videoLoading, setVideoLoading] = React.useState()
  const [videoFilter, setVideoFilter] = React.useState({ name: new URLSearchParams(new URL(window.location.href).search).get('search') || '', latest: false })

  const scrollElementRef = React.useRef()

  const { scrollTop } = useScroll({ time: 1000 })
  const { active } = useActivation()

  const onFetchVideo = async () => {
    const seed = videoFilter.latest ? 10000000000000 : Math.round(Math.random() * 10000 + 1)

    setVideoSeed(seed)

    setVideo([])
    setVideoLoading(true)

    await Fetch.json('/api/app/video/find/list', { filter: { ...videoFilter, status: 1, latest: undefined }, seed: seed, skip: 0, limit: 10 })
      .then(res => {
        setVideo(res.data)
        if (res.data.length !== 0) setVideoLoadEnable(true)
        if (res.data.length === 0) setVideoLoadEnable(false)
      })
      .catch(res => {
        setVideoLoadEnable(false)
        if (contextApp.tabPage === 0) contextApp.messageArrayAction.add('检索内容失败')
      })

    setVideoLoading(false)
  }

  const onFetchVideoScroll = async () => {
    setVideoLoading(true)

    await Fetch.json('/api/app/video/find/list', { filter: { ...videoFilter, status: 1, latest: undefined }, seed: videoSeed, skip: video.length, limit: 10 })
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

  const onRefresh = async () => {
    await onFetchVideo()
  }

  const onEdit = (video) => {
    contextApp.dialogsArrayAction.add('VideoInformationOperation', { _id: video._id, onRefresh: async () => await onRefresh() })
  }

  const onDelete = (video) => {
    const onConfirm = async () => {
      contextApp.loadingArrayAction.add('VideoInformationDelete')

      await Fetch.json('/api/app/admin/video/delete', { video_id: video._id })
        .then(res => {
          contextApp.messageArrayAction.add('删除成功')
        })
        .catch(res => {
          contextApp.messageArrayAction.add(res.message || '系统异常')
        })

      contextApp.loadingArrayAction.remove('VideoInformationDelete')

      onRefresh()
    }

    contextApp.dialogsArrayAction.add('Confirm', { content: '是否确认删除当前作品', onConfirm: onConfirm })
  }

  const onClose = () => {
    navigate('/')
  }

  const onScrollTop = () => {
    document.documentElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  const initVideo = async () => {
    await onFetchVideo()
  }

  React.useEffect(() => {
    if (video.length >= 10 && videoLoadEnable === true && videoLoading === false && scrollElementRef.current) {
      const observer = new IntersectionObserver(en => {
        if (en[0].intersectionRatio > 0) onFetchVideoScroll()
      })

      observer.observe(scrollElementRef.current)

      return () => observer.disconnect()
    }
  }, [video, videoLoadEnable, videoLoading])

  React.useEffect(() => { initVideo() }, [videoFilter, contextApp.user])

  const Component =
    <>

      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', padding: 24, paddingBottom: 96 }}>
        <div style={{ width: '100%', maxWidth: 1200, height: 'fit-content' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Typography color='primary' style={{ fontSize: 28 }}>视频</Typography>
            <CloseIcon color='primary' style={{ width: 32, height: 32, cursor: 'pointer' }} onClick={onClose} />
          </div>

          <div style={{ display: 'flex', gap: 4, width: '100%', marginBottom: 16 }}>
            <div style={{ flexGrow: 1, flexShrink: 1, display: 'flex', alignItems: 'center', gap: 4, overflowY: 'auto' }}>
              <Button style={{ flexShrink: 0, minWidth: 'unset', padding: '4px 8px', fontSize: 14, lineHeight: '24px' }} onClick={() => setVideoFilter({ ...videoFilter, latest: false })}>推荐</Button>
              <Button style={{ flexShrink: 0, minWidth: 'unset', padding: '4px 8px', fontSize: 14, lineHeight: '24px' }} variant={videoFilter.latest ? 'contained' : 'text'} onClick={() => setVideoFilter({ ...videoFilter, latest: !videoFilter.latest })}>最新发布</Button>
            </div>
            <div style={{ width: 'fit-content', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={onFetchVideo}><RefreshIcon style={{ width: 24, height: 24 }} /></Button>
              {
                videoFilter.name === '' ?
                  <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={() => contextApp.dialogsArrayAction.add('VideoFilter', { text: videoFilter.name, onConfirm: (text) => setVideoFilter({ ...videoFilter, name: text }) })}>
                    <SearchIcon style={{ width: 24, height: 24 }} />
                  </Button>
                  : null
              }
              {
                videoFilter.name !== '' ?
                  <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={() => setVideoFilter({ ...videoFilter, name: '' })}>
                    <SearchIcon style={{ width: 24, height: 24 }} />
                    <div style={{ maxWidth: 80, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{videoFilter.name}</div>
                  </Button>
                  : null
              }
            </div>
          </div>

          {
            video.length !== 0 ?
              <Resize>
                {
                  ({ size }) => {
                    var breakpointCols = 0

                    if (size && size.width > 0) breakpointCols = 2
                    if (size && size.width > 720) breakpointCols = 3
                    if (size && size.width > 1080) breakpointCols = 4

                    return <div>
                      {
                        breakpointCols ?
                          <PosterCardMasonry
                            imageProps={{ styleMediaVisible: { width: '100%' }, styleMediaInvisible: { width: '100%', aspectRatio: '1 / 1' } }}
                            breakpointCols={breakpointCols}
                            cards={video}
                            onClickCard={(card) => navigate(`/video/${card._id}`)}
                            onEdit={contextApp.user.subscription === 'administrator' ? onEdit : undefined}
                            onDelete={contextApp.user.subscription === 'administrator' ? onDelete : undefined}
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
            videoLoading === false && videoLoadEnable === false && video.length === 0 ?
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
        </div>
      </div>

      {
        active === true ?
          ReactDOM.createPortal(
            <>
              <Fab disabled={scrollTop === 0} color='primary' style={{ position: 'fixed', bottom: 24, right: 24, opacity: scrollTop > 0 ? 1 : 0, transition: '0.5s all' }} onClick={onScrollTop}><ArrowUpwardIcon /></Fab>
            </>
            , document.body)
          : null
      }

    </>

  return Component
}

export default App