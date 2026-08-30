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

  const [cartoonSeed, setCartoonSeed] = React.useState(1)
  const [cartoon, setCartoon] = React.useState([])
  const [cartoonLoadEnable, setCartoonLoadEnable] = React.useState()
  const [cartoonLoading, setCartoonLoading] = React.useState()
  const [cartoonFilter, setCartoonFilter] = React.useState({ name: new URLSearchParams(new URL(window.location.href).search).get('search') || '', latest: false, status: [1] })

  const scrollElementRef = React.useRef()

  const { scrollTop } = useScroll({ time: 1000 })
  const { active } = useActivation()

  const onFetchCartoon = async () => {
    const seed = cartoonFilter.latest ? 10000000000000 : Math.round(Math.random() * 10000 + 1)

    setCartoonSeed(seed)

    setCartoon([])
    setCartoonLoading(true)

    await Fetch.json('/api/app/cartoon/find/list', { filter: { ...cartoonFilter, latest: undefined }, seed: seed, skip: 0, limit: 10 })
      .then(res => {
        setCartoon(res.data)
        if (res.data.length !== 0) setCartoonLoadEnable(true)
        if (res.data.length === 0) setCartoonLoadEnable(false)
      })
      .catch(res => {
        setCartoonLoadEnable(false)
        if (contextApp.tabPage === 0) contextApp.messageArrayAction.add('检索内容失败')
      })

    setCartoonLoading(false)
  }

  const onFetchCartoonScroll = async () => {
    setCartoonLoading(true)

    await Fetch.json('/api/app/cartoon/find/list', { filter: { ...cartoonFilter, latest: undefined }, seed: cartoonSeed, skip: cartoon.length, limit: 10 })
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

  const onEdit = (cartoon) => {
    const onRefresh = async (cartoon) => {
      contextApp.loadingArrayAction.add('CartoonInformationEdit')

      await Fetch.json('/api/app/cartoon/find', { cartoon_id: cartoon._id })
        .then(res => {
          setCartoon(i => i.map(n => n._id === res.data._id ? res.data : n))
        })
        .catch(res => {
          setCartoon(i => i.filter(n => n._id !== cartoon._id))
        })

      contextApp.loadingArrayAction.remove('CartoonInformationEdit')
    }

    contextApp.dialogsArrayAction.add('CartoonInformationOperation', { _id: cartoon._id, onRefresh: async () => await onRefresh(cartoon) })
  }

  const onDelete = (cartoon) => {
    const onConfirm = async () => {
      contextApp.loadingArrayAction.add('CartoonInformationDelete')

      await Fetch.json('/api/app/admin/cartoon/delete', { cartoon_id: cartoon._id })
        .then(res => {
          contextApp.messageArrayAction.add('删除成功')
        })
        .catch(res => {
          contextApp.messageArrayAction.add(res.message || '系统异常')
        })

      contextApp.loadingArrayAction.remove('CartoonInformationDelete')

      onFetchCartoonRefresh(cartoon)
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

  const initCartoon = async () => {
    await onFetchCartoon()
  }

  React.useEffect(() => {
    if (cartoon.length >= 10 && cartoonLoadEnable === true && cartoonLoading === false && scrollElementRef.current) {
      const observer = new IntersectionObserver(en => {
        if (en[0].intersectionRatio > 0) onFetchCartoonScroll()
      })

      observer.observe(scrollElementRef.current)

      return () => observer.disconnect()
    }
  }, [cartoon, cartoonLoadEnable, cartoonLoading])

  React.useEffect(() => { initCartoon() }, [cartoonFilter, contextApp.user])

  const Component =
    <>

      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', padding: 24, paddingBottom: 96 }}>
        <div style={{ width: '100%', maxWidth: 1200, height: 'fit-content' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Typography color='primary' style={{ fontSize: 28 }}>漫画</Typography>
            <CloseIcon color='primary' style={{ width: 32, height: 32, cursor: 'pointer' }} onClick={onClose} />
          </div>

          <div style={{ display: 'flex', gap: 4, width: '100%', marginBottom: 16 }}>
            <div style={{ flexGrow: 1, flexShrink: 1, display: 'flex', alignItems: 'center', gap: 4, overflowY: 'auto' }}>
              <Button style={{ flexShrink: 0, minWidth: 'unset', padding: '4px 8px', fontSize: 14, lineHeight: '24px' }} onClick={() => setCartoonFilter({ ...cartoonFilter, latest: false })}>推荐</Button>
              <Button style={{ flexShrink: 0, minWidth: 'unset', padding: '4px 8px', fontSize: 14, lineHeight: '24px' }} variant={cartoonFilter.latest ? 'contained' : 'text'} onClick={() => setCartoonFilter({ ...cartoonFilter, latest: !cartoonFilter.latest })}>最新发布</Button>
            </div>
            <div style={{ width: 'fit-content', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              {
                contextApp.user.subscription === 'administrator' ?
                  <>
                    {
                      cartoonFilter.status.includes(0) ? <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={() => setCartoonFilter({ ...cartoonFilter, status: [1] })}>未发布</Button> : null
                    }
                    {
                      cartoonFilter.status.includes(1) ? <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={() => setCartoonFilter({ ...cartoonFilter, status: [0] })}>已发布</Button> : null
                    }
                  </>
                  : null
              }
              {
                cartoonFilter.name === '' ?
                  <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={() => contextApp.dialogsArrayAction.add('CartoonFilter', { text: cartoonFilter.name, onConfirm: (text) => setCartoonFilter({ ...cartoonFilter, name: text }) })}>
                    <SearchIcon style={{ width: 24, height: 24 }} />
                  </Button>
                  : null
              }
              {
                cartoonFilter.name !== '' ?
                  <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={() => setCartoonFilter({ ...cartoonFilter, name: '' })}>
                    <SearchIcon style={{ width: 24, height: 24 }} />
                    <div style={{ maxWidth: 80, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cartoonFilter.name}</div>
                  </Button>
                  : null
              }
              <Button style={{ minWidth: 'unset', padding: '4px 8px' }} onClick={onFetchCartoon}><RefreshIcon style={{ width: 24, height: 24 }} /></Button>
            </div>
          </div>

          {
            cartoon.length !== 0 ?
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
                            cards={cartoon}
                            onClickCard={(card) => navigate(`/cartoon/${card._id}`)}
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
            cartoonLoading === false && cartoonLoadEnable === false && cartoon.length === 0 ?
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

export default App