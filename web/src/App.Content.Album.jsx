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

import { useScroll } from './App.ComponentHookPure.Scroll'
import { useActivation } from './App.ComponentHookPure.Activation'
import { Resize } from './App.ComponentHookPure.Resize'

import { Context as ContextApp } from './App'

import { Fetch } from './utils.fetch'

import PosterCardMasonry from './App.ComponentContent.PosterCardMasonry'

function App() {
  const navigate = ReactRouterDom.useNavigate()

  const contextApp = React.useContext(ContextApp)

  const [albumSeed, setAlbumSeed] = React.useState(1)
  const [album, setAlbum] = React.useState([])
  const [albumLoadEnable, setAlbumLoadEnable] = React.useState()
  const [albumLoading, setAlbumLoading] = React.useState()
  const [albumFilter, setAlbumFilter] = React.useState({ name: new URLSearchParams(new URL(window.location.href).search).get('search') || '', latest: false, status: [1] })

  const scrollElementRef = React.useRef()

  const { scrollTop } = useScroll({ time: 1000 })
  const { active } = useActivation()

  const onFetchAlbum = async () => {
    const seed = albumFilter.latest ? 10000000000000 : Math.round(Math.random() * 10000 + 1)

    setAlbumSeed(seed)

    setAlbum([])
    setAlbumLoading(true)

    await Fetch.json('/api/app/album/find/list', { filter: { ...albumFilter, latest: undefined }, seed: seed, skip: 0, limit: 10 })
      .then(res => {
        setAlbum(res.data)
        if (res.data.length !== 0) setAlbumLoadEnable(true)
        if (res.data.length === 0) setAlbumLoadEnable(false)
      })
      .catch(res => {
        setAlbumLoadEnable(false)
        if (contextApp.tabPage === 0) contextApp.messageArrayAction.add('检索内容失败')
      })

    setAlbumLoading(false)
  }

  const onFetchAlbumScroll = async () => {
    setAlbumLoading(true)

    await Fetch.json('/api/app/album/find/list', { filter: { ...albumFilter, latest: undefined }, seed: albumSeed, skip: album.length, limit: 10 })
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

  const onEdit = (album) => {
    const onRefresh = async (album) => {
      contextApp.loadingArrayAction.add('AlbumInformationEdit')

      await Fetch.json('/api/app/album/find', { album_id: album._id })
        .then(res => {
          setAlbum(i => i.map(n => n._id === res.data._id ? res.data : n))
        })
        .catch(res => {
          setAlbum(i => i.filter(n => n._id !== album._id))
        })

      contextApp.loadingArrayAction.remove('AlbumInformationEdit')
    }

    contextApp.dialogsArrayAction.add('AlbumInformationOperation', { _id: album._id, onRefresh: async () => await onRefresh(album) })
  }

  const onDelete = (album) => {
    const onConfirm = async () => {
      contextApp.loadingArrayAction.add('AlbumInformationDelete')

      await Fetch.json('/api/app/admin/album/delete', { album_id: album._id })
        .then(res => {
          contextApp.messageArrayAction.add('删除成功')
        })
        .catch(res => {
          contextApp.messageArrayAction.add(res.message || '系统异常')
        })

      contextApp.loadingArrayAction.remove('AlbumInformationDelete')

      onFetchAlbumRefresh(album)
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

  const initAlbum = async () => {
    await onFetchAlbum()
  }

  React.useEffect(() => {
    if (album.length >= 10 && albumLoadEnable === true && albumLoading === false && scrollElementRef.current) {
      const observer = new IntersectionObserver(en => {
        if (en[0].intersectionRatio > 0) onFetchAlbumScroll()
      })

      observer.observe(scrollElementRef.current)

      return () => observer.disconnect()
    }
  }, [album, albumLoadEnable, albumLoading])

  React.useEffect(() => { initAlbum() }, [albumFilter, contextApp.user])

  const Component =
    <>

      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', padding: 24, paddingBottom: 96 }}>
        <div style={{ width: '100%', maxWidth: 1200, height: 'fit-content' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Typography color='primary' style={{ fontSize: 28 }}>图集</Typography>
            <CloseIcon color='primary' style={{ width: 32, height: 32, cursor: 'pointer' }} onClick={onClose} />
          </div>

          <div style={{ display: 'flex', gap: 4, width: '100%', marginBottom: 16 }}>
            <div style={{ flexGrow: 1, flexShrink: 1, display: 'flex', alignItems: 'center', gap: 4, overflowY: 'auto' }}>
              <Button style={{ flexShrink: 0, minWidth: 'unset', padding: '4px 8px', fontSize: 14, lineHeight: '24px' }} onClick={() => setAlbumFilter({ ...albumFilter, latest: false })}>推荐</Button>
              <Button style={{ flexShrink: 0, minWidth: 'unset', padding: '4px 8px', fontSize: 14, lineHeight: '24px' }} variant={albumFilter.latest ? 'contained' : 'text'} onClick={() => setAlbumFilter({ ...albumFilter, latest: !albumFilter.latest })}>最新发布</Button>
            </div>
            <div style={{ width: 'fit-content', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              {
                contextApp.user.subscription === 'administrator' ?
                  <>
                    {
                      albumFilter.status.includes(0) ? <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={() => setAlbumFilter({ ...albumFilter, status: [1] })}>未发布</Button> : null
                    }
                    {
                      albumFilter.status.includes(1) ? <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={() => setAlbumFilter({ ...albumFilter, status: [0] })}>已发布</Button> : null
                    }
                  </>
                  : null
              }
              {
                albumFilter.name === '' ?
                  <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={() => contextApp.dialogsArrayAction.add('AlbumFilter', { text: albumFilter.name, onConfirm: (text) => setAlbumFilter({ ...albumFilter, name: text }) })}>
                    <SearchIcon style={{ width: 24, height: 24 }} />
                  </Button>
                  : null
              }
              {
                albumFilter.name !== '' ?
                  <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={() => setAlbumFilter({ ...albumFilter, name: '' })}>
                    <SearchIcon style={{ width: 24, height: 24 }} />
                    <div style={{ maxWidth: 80, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{albumFilter.name}</div>
                  </Button>
                  : null
              }
              <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={onFetchAlbum}><RefreshIcon style={{ width: 24, height: 24 }} /></Button>
            </div>
          </div>

          {
            album.length !== 0 ?
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
                            cards={album}
                            onClickCard={(card) => navigate(`/album/${card._id}`)}
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
            albumLoading === false && albumLoadEnable === false && album.length === 0 ?
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