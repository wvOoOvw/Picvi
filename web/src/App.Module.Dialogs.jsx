import React from 'react'
import * as ReactRouterDom from "react-router-dom"

import { Suspense } from './App.ComponentPure.Suspense'

import { Context as ContextApp } from './App'

const AlbumFilter = React.lazy(() => import('./App.Dialogs.AlbumFilter'))
const AlbumInformationOperation = React.lazy(() => import('./App.Dialogs.AlbumInformationOperation'))

const VideoFilter = React.lazy(() => import('./App.Dialogs.VideoFilter'))
const VideoInformationOperation = React.lazy(() => import('./App.Dialogs.VideoInformationOperation'))

const CartoonFilter = React.lazy(() => import('./App.Dialogs.CartoonFilter'))
const CartoonInformationOperation = React.lazy(() => import('./App.Dialogs.CartoonInformationOperation'))

const UserLogin = React.lazy(() => import('./App.Dialogs.UserLogin'))
const UserRegister = React.lazy(() => import('./App.Dialogs.UserRegister'))
const UserInformationOperation = React.lazy(() => import('./App.Dialogs.UserInformationOperation'))

const Contact = React.lazy(() => import('./App.Dialogs.Contact'))
const ContactChat = React.lazy(() => import('./App.Dialogs.ContactChat'))

const MediaView = React.lazy(() => import('./App.Dialogs.Global.MediaView'))
const Confirm = React.lazy(() => import('./App.Dialogs.Global.Confirm'))

const System = React.lazy(() => import('./App.Dialogs.System'))

const Subscribe = React.lazy(() => import('./App.Dialogs.Subscribe'))

function App() {
  const pathname = ReactRouterDom.useLocation().pathname

  const contextApp = React.useContext(ContextApp)

  // React.useEffect(() => { contextApp.setDialogsArray([]) }, [pathname])

  const Component =
    <>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('AlbumFilter')}><AlbumFilter /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('AlbumInformationOperation')}><AlbumInformationOperation /></Suspense>

      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('VideoFilter')}><VideoFilter /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('VideoInformationOperation')}><VideoInformationOperation /></Suspense>

      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('CartoonFilter')}><CartoonFilter /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('CartoonInformationOperation')}><CartoonInformationOperation /></Suspense>

      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('UserLogin')}><UserLogin /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('UserRegister')}><UserRegister /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('UserInformationOperation')}><UserInformationOperation /></Suspense>

      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('Contact')}><Contact /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('ContactChat')}><ContactChat /></Suspense>

      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('MediaView')}><MediaView /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('Confirm')}><Confirm /></Suspense>

      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('System')}><System /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('Subscribe')}><Subscribe /></Suspense>
    </>

  return Component
}

export default App