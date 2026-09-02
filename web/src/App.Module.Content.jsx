import React from 'react'
import * as ReactRouterDom from "react-router-dom"
import * as ReactActivation from "react-activation"

import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'

import { SuspenseFallback } from './App.ComponentPure.Suspense'

import { Context as ContextApp } from './App'

import favicon from '../static/image/favicon.png'

// const Empty = React.lazy(() => import('./App.Content.Empty'))
const Landing = React.lazy(() => import('./App.Content.Landing'))
const Album = React.lazy(() => import('./App.Content.ResourceAlbum'))
const AlbumView = React.lazy(() => import('./App.Content.ResourceAlbumView'))
const Video = React.lazy(() => import('./App.Content.ResourceVideo'))
const VideoView = React.lazy(() => import('./App.Content.ResourceVideoView'))
const Cartoon = React.lazy(() => import('./App.Content.ResourceCartoon'))
const CartoonView = React.lazy(() => import('./App.Content.ResourceCartoonView'))
const User = React.lazy(() => import('./App.Content.User'))
const SystemResubscription = React.lazy(() => import('./App.Content.SystemResubscription'))
const SystemResearch = React.lazy(() => import('./App.Content.SystemResearch'))

function Login() {
  const contextApp = React.useContext(ContextApp)

  const onLogin = () => {
    contextApp.dialogsArrayAction.add('UserLogin')
  }

  React.useEffect(() => {
    contextApp.dialogsArrayAction.add('UserLogin')
    contextApp.messageArrayAction.add('请先登录')
  }, [])

  const Component =
    <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <Avatar src={favicon} style={{ width: 48, height: 48 }} />
      <Button onClick={onLogin}>登录 / 注册</Button>
    </div>

  return Component
}

function RouteComponent(props) {
  const pathname = ReactRouterDom.useLocation().pathname

  const contextApp = React.useContext(ContextApp)

  const Component =
    <ReactActivation.KeepAlive id={pathname}>
      <React.Suspense fallback={<SuspenseFallback name='Content' />}>
        {
          contextApp.user || pathname === '/' ? props.children : <Login />
        }
      </React.Suspense>
    </ReactActivation.KeepAlive>

  return Component
}

function App() {
  const Component =
    <ReactRouterDom.Routes>
      <ReactRouterDom.Route path="/" element={<RouteComponent><Landing /></RouteComponent>} />
      <ReactRouterDom.Route path="/album" element={<RouteComponent><Album /></RouteComponent>} />
      <ReactRouterDom.Route path="/album/:_id" element={<RouteComponent><AlbumView /></RouteComponent>} />
      <ReactRouterDom.Route path="/video" element={<RouteComponent><Video /></RouteComponent>} />
      <ReactRouterDom.Route path="/video/:_id" element={<RouteComponent><VideoView /></RouteComponent>} />
      <ReactRouterDom.Route path="/cartoon" element={<RouteComponent><Cartoon /></RouteComponent>} />
      <ReactRouterDom.Route path="/cartoon/:_id" element={<RouteComponent><CartoonView /></RouteComponent>} />
      <ReactRouterDom.Route path="/user" element={<RouteComponent><User /></RouteComponent>} />
      <ReactRouterDom.Route path="/systemresubscription" element={<RouteComponent><SystemResubscription /></RouteComponent>} />
      <ReactRouterDom.Route path="/systemresearch" element={<RouteComponent><SystemResearch /></RouteComponent>} />
    </ReactRouterDom.Routes>

  return Component
}

export default App