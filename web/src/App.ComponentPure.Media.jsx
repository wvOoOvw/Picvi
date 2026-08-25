import React from 'react'

import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Avatar from '@mui/material/Avatar'

import BrokenImageIcon from '@mui/icons-material/BrokenImage'

import { useLoadMedia } from './App.ComponentHookPure.LoadMedia'

import { extension } from './utils.extension'

function MediaSuspense(props) {
  const Component =
    <>
      <div style={{ ...props.style }} ref={props.intersectionRef} />
    </>

  return Component
}

function MediaBroken(props) {
  const Component =
    <>
      {
        props.mode !== 'Avatar' ?
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, ...props.style }}>
            <BrokenImageIcon style={{ opacity: 0.5 }} />
            <Typography variant='body2' style={{ fontSize: 12, color: 'black', opacity: 0.5 }}>图片加载失败</Typography>
          </div>
          : null
      }
      {
        props.mode === 'Avatar' ? <Avatar style={{ width: '100%', ...props.style }} src={undefined} /> : null
      }
    </>

  return Component
}

function MediaLoading(props) {
  const Component =
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', ...props.style }}>
      <CircularProgress color='primary' size={props.loadingSize} />
    </div>

  return Component
}

function MediaContent(props) {
  const ImageRender =
    <>
      {
        props.extensionMode === 'Image' && props.mode !== 'Avatar' ? <img style={{ width: '100%', height: '100%', objectFit: props.objectFit || 'cover' }} src={props.src} /> : null
      }
      {
        props.extensionMode === 'Image' && props.mode === 'Avatar' ? <Avatar style={{ width: '100%', height: '100%' }} src={props.src} /> : null
      }
      {
        props.extensionMode === 'Video' ? <video style={{ width: '100%', height: '100%', objectFit: props.objectFit }} src={props.src} autoPlay={props.autoPlay} muted={props.muted} loop={props.loop} controls={props.controls} playsInline /> : null
      }
    </>

  const Loading =
    <>
      {
        props.loading ? <MediaLoading style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, background: 'rgba(255, 255, 255, 1)' }} loadingSize={props.loadingSize} /> : null
      }
    </>

  const Component =
    <>
      {
        props.children === undefined ?
          <>
            {
              props.card === true && props.cardActionArea !== true ?
                <Card style={{ position: 'relative', ...props.style }} onClick={props.onClick} ref={props.intersectionRef}>
                  {
                    ImageRender
                  }
                  {
                    Loading
                  }
                </Card>
                : null
            }
            {
              props.card !== true && props.cardActionArea === true ?
                <CardActionArea style={{ position: 'relative', ...props.style }} onClick={props.onClick} component='div' ref={props.intersectionRef}>
                  {
                    ImageRender
                  }
                  {
                    Loading
                  }
                </CardActionArea>
                : null
            }
            {
              props.card === true && props.cardActionArea === true ?
                <Card style={{ position: 'relative', ...props.style }} onClick={props.onClick} ref={props.intersectionRef}>
                  <CardActionArea style={{ width: '100%', height: '100%' }} component='div'>
                    {
                      ImageRender
                    }
                    {
                      Loading
                    }
                  </CardActionArea>
                </Card>
                : null
            }
            {
              props.card !== true && props.cardActionArea !== true ?
                <div style={{ position: 'relative', ...props.style }} onClick={props.onClick} ref={props.intersectionRef}>
                  {
                    ImageRender
                  }
                  {
                    Loading
                  }
                </div>
                : null
            }
          </>
          : null
      }

      {
        props.children !== undefined ? props.children : null
      }
    </>

  return Component
}

function Media(props) {
  const children = props.children
  const src = props.src
  const mode = props.mode
  const lazy = props.lazy
  const card = props.card
  const cardActionArea = props.cardActionArea
  const loadingSize = props.loadingSize
  const objectFit = props.objectFit
  
  const autoPlay = props.autoPlay
  const muted = props.muted
  const loop = props.loop
  const controls = props.controls

  const onClick = props.onClick
  const onCallbackSize = props.onCallbackSize

  const style = props.style
  const styleMediaVisible = props.styleMediaVisible
  const styleMediaInvisible = props.styleMediaInvisible
  const styleMediaLoading = props.styleMediaLoading
  const styleMediaBroken = props.styleMediaBroken
  const styleMediaSuspense = props.styleMediaSuspense



  const extensionMode = extension(src)

  const { mediaSrc, mediaSrcPrevious, loading, loadingSuccess, loadingFail, intersectionRef } = useLoadMedia({ src: src, lazy: lazy, onCallbackSize: onCallbackSize })

  const Component =
    <>
      {
        (mediaSrcPrevious !== undefined && loadingFail !== true) || (mediaSrcPrevious === undefined && loadingSuccess === true) ?
          <MediaContent
            children={children}
            src={mediaSrc || mediaSrcPrevious}
            mode={mode}
            extensionMode={extensionMode}
            loading={loading}
            loadingSize={loadingSize}
            card={card}
            cardActionArea={cardActionArea}
            intersectionRef={intersectionRef}
            onClick={onClick}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            controls={controls}
            objectFit={objectFit}
            style={{ ...style, ...styleMediaVisible }}
          />
          : null
      }
      {
        loadingFail === true ? <MediaBroken mode={mode} style={{ ...style, ...styleMediaInvisible, ...styleMediaBroken }} /> : null
      }
      {
        loading === true && mediaSrcPrevious === undefined ? <MediaLoading loadingSize={loadingSize} style={{ ...style, ...styleMediaInvisible, ...styleMediaLoading }} /> : null
      }
      {
        loading !== true && loadingSuccess !== true && loadingFail !== true && mediaSrcPrevious === undefined ? <MediaSuspense intersectionRef={intersectionRef} style={{ ...style, ...styleMediaInvisible, ...styleMediaSuspense }} /> : null
      }
    </>

  return Component
}

export default Media

export { Media, MediaSuspense, MediaBroken, MediaLoading, MediaContent }
