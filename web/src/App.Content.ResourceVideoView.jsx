import React from 'react'
import * as ReactRouterDom from "react-router-dom"
import * as ReactActivation from "react-activation"

import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'

import CopyAllIcon from '@mui/icons-material/CopyAll'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'

import { useResize } from './App.ComponentHookPure.Resize'
import { Media } from './App.ComponentPure.Media'
import PosterCardMasonry from './App.ComponentContent.PosterCardMasonry'

import { Context as ContextApp } from './App'

import { Fetch, urlDecode } from './utils.fetch'
import { copy } from './utils.copy'
import CryptoJS from 'crypto-js'
import { createCrypto } from '../../common/crypto-web.js'

const { decryptArrayBuffer, getEncUrlMime } = createCrypto(CryptoJS)
import { emptyImage } from './utils.emptyImage'

import AvatarEmpty from '../static/image/AvatarEmpty.jpg'

function App() {
  const navigate = ReactRouterDom.useNavigate()
  const params = ReactRouterDom.useParams()

  const contextApp = React.useContext(ContextApp)

  const [viewImageLinkIndex, setViewIndex] = React.useState(0)
  const [viewImageSize, setViewImageSize] = React.useState()
  const [favoriteLoading, setFavoriteLoading] = React.useState(false)

  const [item, setItem] = React.useState()
  const [favorited, setFavorited] = React.useState()
  const [recent, setRecent] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const { size: screenSize } = useResize()

  const viewImageLink = React.useMemo(() => item ? (item.subscribeview || item.preview) : [], [item])
  const emptyImageMemo = React.useMemo(() => emptyImage(), [])

  const paneStyleWidth = React.useMemo(() => {
    if (viewImageSize && screenSize) {
      var a = 480
      var b = 320
      var max = Math.min(1200, screenSize.width)
      var gap = 72

      a = a * (viewImageSize.width / viewImageSize.height)

      if (a > max - b - gap) a = max - b - gap
      if (a < 480) a = 480

      if (b > max - a - gap) b = a
      if (b < 320) b = 320

      return [a, b]
    }
    if (viewImageSize === undefined || screenSize === undefined) {
      return [undefined, undefined]
    }
  }, [viewImageSize, screenSize])

  const onFavorite = async () => {
    setFavoriteLoading(true)

    if (favorited === true) {
      await Fetch.json('/api/app/user/update/video/favorite', { video_id: item._id, favorite: false })
        .then(() => {
          contextApp.messageArrayAction.add('已取消收藏')
        })
        .catch(res => {
          contextApp.messageArrayAction.add(res.message || '取消收藏失败')
        })
    }

    if (favorited !== true) {
      await Fetch.json('/api/app/user/update/video/favorite', { video_id: item._id, favorite: true })
        .then(() => {
          contextApp.messageArrayAction.add('已收藏')
        })
        .catch(res => {
          contextApp.messageArrayAction.add(res.message || '收藏失败')
        })
    }

    await onFetchRefresh()

    setFavoriteLoading(false)
  }

  const onSubscribe = async () => {
    contextApp.messageArrayAction.add('请升级订阅会员')
    contextApp.dialogsArrayAction.add('Subscribe')
  }

  const onCopy = async (text) => {
    await copy(text)
      .then(() => {
        contextApp.messageArrayAction.add('已复制到剪贴板')
      })
      .catch(() => {
        contextApp.messageArrayAction.add('复制失败')
      })
  }

  const onDownloadOne = async (index) => {
    const url = urlDecode(viewImageLink[index])

    const minetype = url.replace(/\.enc$/, '').match(/\.([a-zA-Z0-9]+)$/)?.[1]

    const buffer = await Fetch.arrayBufferUnauth(url)
    const blob = await decryptArrayBuffer(buffer, getEncUrlMime(url))

    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${item.name + ' ' + index}.${minetype}`
    a.click()
    a.remove()
  }

  const onDownloadAll = async () => {
    for (let i = 0; i < viewImageLink.length; i++) {
      await onDownloadOne(i)
    }
  }

  const onFetch = async () => {
    setLoading(true)
    setViewIndex(0)
    setViewImageSize(undefined)

    await Fetch.json('/api/app/video/find', { video_id: params._id })
      .then(res => {
        setItem(res.data)
      })
      .catch(res => {
        contextApp.messageArrayAction.add('查询错误')
      })

    await Fetch.json('/api/app/video/find/favorited', { video_id: params._id })
      .then(res => {
        setFavorited(res.data)
      })
      .catch(res => {
        contextApp.messageArrayAction.add('查询错误')
      })

    await new Promise(resolve => setTimeout(() => resolve(), 500))

    setLoading(false)
  }

  const onFetchRefresh = async () => {
    await Fetch.json('/api/app/video/find', { video_id: params._id })
      .then(res => {
        setItem(res.data)
      })
      .catch(res => {
        contextApp.messageArrayAction.add('查询错误')
      })

    await Fetch.json('/api/app/video/find/favorited', { video_id: params._id })
      .then(res => {
        setFavorited(res.data)
      })
      .catch(res => {
        contextApp.messageArrayAction.add('查询错误')
      })
  }

  const onFetchRecent = async () => {
    const seed = Math.round(Math.random() * 10000 + 1)

    await Fetch.json('/api/app/video/find/list', { filter: { status: 1, actor: item.actor }, seed: seed, skip: 0, limit: 8 })
      .then(res => {
        setRecent(res.data)
      })
  }

  React.useEffect(() => { onFetch() }, [params._id])
  React.useEffect(() => { if (item && recent.length === 0) onFetchRecent() }, [item])

  ReactActivation.useActivate(() => { onFetchRefresh() })

  const Component =
    <>
      {
        loading !== true ?
          <>
            {
              item !== undefined && item._id === params._id ?
                <>
                  {
                    item.status === 1 ?
                      <>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: paneStyleWidth[0] === paneStyleWidth[1] ? 0 : 32, padding: '0px 24px', paddingBottom: 96, display: viewImageSize && screenSize ? 'flex' : 'none' }}>
                          <div style={{ width: paneStyleWidth[0], maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <Paper style={{ width: '100%', borderRadius: '0px 0px 24px 24px', overflow: 'hidden', position: 'relative' }}>
                                {
                                  viewImageLink.length > 0 ?
                                    <>
                                      <Media
                                        controls
                                        cardActionArea
                                        src={viewImageLink[viewImageLinkIndex]}
                                        loadingSize={32}
                                        styleMediaVisible={{ width: '100%' }}
                                        styleMediaInvisible={{ width: 420, maxWidth: '100%', aspectRatio: '1 / 1' }}
                                        onClick={() => contextApp.dialogsArrayAction.add('MediaView', { src: viewImageLink[viewImageLinkIndex] })}
                                        onCallbackSize={size => setViewImageSize(size)}
                                      />
                                      {
                                        item.subscribeview === undefined ? <Button fullWidth variant='contained' component='div' color='inherit' style={{ minWidth: 'unset', padding: '8px 12px', fontSize: 14, opacity: 0.75, position: 'absolute', bottom: 0 }} onClick={onSubscribe}>查看全部内容</Button> : null
                                      }
                                    </>
                                    : null
                                }
                                {
                                  viewImageLink.length === 0 ?
                                    <>
                                      <Media
                                        controls
                                        cardActionArea
                                        src={emptyImageMemo}
                                        loadingSize={32}
                                        styleMediaVisible={{ width: '100%' }}
                                        styleMediaInvisible={{ width: 420, maxWidth: '100%', aspectRatio: '1 / 1' }}
                                        onCallbackSize={size => setViewImageSize(size)}
                                      />
                                      {
                                        item.subscribeview === undefined ? <Button fullWidth variant='contained' component='div' color='inherit' style={{ minWidth: 'unset', padding: '8px 12px', fontSize: 14, opacity: 0.75, position: 'absolute', bottom: 0 }} onClick={onSubscribe}>查看全部内容</Button> : null
                                      }
                                      <Button variant='contained' component='div' color='inherit' style={{ minWidth: 'unset', padding: '4px 12px', fontSize: 12, opacity: 0.75, position: 'absolute', top: 8, right: 8 }}>暂无预览图</Button>
                                    </>
                                    : null
                                }
                              </Paper>

                              {
                                viewImageLink.length > 1 ?
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Button disabled={viewImageLinkIndex === 0} onClick={() => setViewIndex(i => i - 1)}><KeyboardArrowLeftIcon />上一页</Button>
                                    <Typography color='primary' style={{ fontSize: 14 }}>{viewImageLinkIndex + 1} / {viewImageLink.length}</Typography>
                                    <Button disabled={viewImageLinkIndex === viewImageLink.length - 1} onClick={() => setViewIndex(i => i + 1)}>下一页<KeyboardArrowRightIcon /></Button>
                                  </div>
                                  : null
                              }
                            </div>

                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Typography variant='body1' style={{ fontSize: 12, opacity: 0.5 }}>视频ID：{item._id}</Typography>
                                <CopyAllIcon style={{ width: 12, height: 12, cursor: 'pointer' }} onClick={() => onCopy(item._id)} />
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                <Typography color='primary' variant='body1' style={{ fontSize: 20 }}>{item.name}</Typography>
                                {
                                  favoriteLoading !== true && favorited === true ? <Button variant='text' color='primary' style={{ minWidth: 'unset', padding: 4, color: 'gray', height: 'fit-content' }} onClick={onFavorite}><StarIcon color='primary' style={{ width: 24, height: 24 }} /></Button> : null
                                }
                                {
                                  favoriteLoading !== true && favorited !== true ? <Button variant='text' color='primary' style={{ minWidth: 'unset', padding: 4, color: 'gray', height: 'fit-content' }} onClick={onFavorite}><StarBorderIcon color='primary' style={{ width: 24, height: 24 }} /></Button> : null
                                }
                                {
                                  favoriteLoading === true ? <Button variant='text' color='primary' style={{ minWidth: 'unset', padding: 4, color: 'gray', height: 'fit-content', fontSize: 12 }}><CircularProgress color='primary' size={24} /></Button> : null
                                }
                              </div>

                              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {
                                  item.description ? <Typography color='primary' style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: 14 }}>{item.description}</Typography> : null
                                }
                                {
                                  item.tag.length > 0 || item.actor.length > 0 ?
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                      {
                                        item.tag.map((i, index) => {
                                          return <Typography key={index} color='primary' style={{ fontSize: 14 }}>#{i}</Typography>
                                        })
                                      }
                                      {
                                        item.actor.map((i, index) => {
                                          return <Typography key={index} color='primary' style={{ fontSize: 14 }}>#{i}</Typography>
                                        })
                                      }
                                    </div>
                                    : null
                                }
                              </div>
                            </div>
                          </div>

                          <div style={{ width: paneStyleWidth[1], maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 32, marginTop: paneStyleWidth[0] === paneStyleWidth[1] ? 32 : 24 }}>
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <Typography color='primary' variant='body1' style={{ fontSize: 20 }} id='download'>下载</Typography>
                              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                                <Button fullWidth variant='contained' style={{ fontSize: 12 }} onClick={item.subscribeview ? () => onDownloadOne(viewImageLinkIndex) : onSubscribe}>下载当前</Button>
                                <Button fullWidth variant='contained' style={{ fontSize: 12 }} onClick={item.subscribeview ? () => onDownloadAll() : onSubscribe}>下载全部</Button>
                              </div>
                            </div>
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <Typography color='primary' variant='body1' style={{ fontSize: 20 }}>相关作品</Typography>
                              <PosterCardMasonry
                                breakpointCols={2}
                                imageProps={{ objectFit: 'cover' }}
                                cards={recent}
                                onClickCard={(card) => navigate(`/video/${card._id}`)}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                      : null
                  }
                  {
                    item.status !== 1 ?
                      <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                        <Avatar src={AvatarEmpty} style={{ width: 48, height: 48 }} />
                        <Button>当前内容未发布</Button>
                      </div>
                      : null
                  }
                </>
                : null
            }
            {
              item === undefined ?
                <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                  <Avatar src={AvatarEmpty} style={{ width: 48, height: 48 }} />
                  <Button>查询不到当前内容</Button>
                </div>
                : null
            }
          </>
          : null
      }
      {
        loading === true ?
          <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress color='primary' size={32} />
          </div>
          : null
      }
    </>

  return Component
}

export default App
