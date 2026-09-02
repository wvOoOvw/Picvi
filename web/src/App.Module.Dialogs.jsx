import React from 'react'
import * as ReactRouterDom from "react-router-dom"

import { Suspense } from './App.ComponentPure.Suspense'

import { Context as ContextApp } from './App'

const ResourceAlbumOperation = React.lazy(() => import('./App.Dialogs.ResourceAlbumOperation'))
const ResourceCartoonOperation = React.lazy(() => import('./App.Dialogs.ResourceCartoonOperation'))
const ResourceVideoOperation = React.lazy(() => import('./App.Dialogs.ResourceVideoOperation'))

const UserLogin = React.lazy(() => import('./App.Dialogs.UserLogin'))
const UserRegister = React.lazy(() => import('./App.Dialogs.UserRegister'))
const UserInformationOperation = React.lazy(() => import('./App.Dialogs.UserInformationOperation'))

const Contact = React.lazy(() => import('./App.Dialogs.Contact'))

const Confirm = React.lazy(() => import('./App.Dialogs.Global.Confirm'))
const MediaView = React.lazy(() => import('./App.Dialogs.Global.MediaView'))
const TextFilter = React.lazy(() => import('./App.Dialogs.Global.TextFilter'))

const System = React.lazy(() => import('./App.Dialogs.System'))
const Subscribe = React.lazy(() => import('./App.Dialogs.Subscribe'))

const SubscribeviewSelector = React.lazy(() => import('./App.Dialogs.Resource.SubscribeviewSelector'))
const ResourceFolderSelector = React.lazy(() => import('./App.Dialogs.Resource.FolderSelector'))

function App() {
  const pathname = ReactRouterDom.useLocation().pathname

  const contextApp = React.useContext(ContextApp)

  // React.useEffect(() => { contextApp.setDialogsArray([]) }, [pathname])
  // React.useEffect(() => { contextApp.setDialogsArray([{ name: 'Subscribe' }]) }, [])

  const Component =
    <>

      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('ResourceAlbumOperation')}><ResourceAlbumOperation /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('ResourceCartoonOperation')}><ResourceCartoonOperation /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('ResourceVideoOperation')}><ResourceVideoOperation /></Suspense>

      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('UserLogin')}><UserLogin /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('UserRegister')}><UserRegister /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('UserOperation')}><UserOperation /></Suspense>

      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('Contact')}><Contact /></Suspense>

      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('Confirm')}><Confirm /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('MediaView')}><MediaView /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('TextFilter')}><TextFilter /></Suspense>

      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('System')}><System /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('Subscribe')}><Subscribe /></Suspense>

      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('SubscribeviewSelector')}><SubscribeviewSelector /></Suspense>
      <Suspense name='Dialogs' open={contextApp.dialogsArrayAction.exist('FolderParse')}><ResourceFolderSelector /></Suspense>
    </>

  return Component
}

export default App