import React from 'react'

import Backdrop from '@mui/material/Backdrop'

import Media from './App.ComponentPure.Media'

import { Context as ContextApp } from './App'

function App() {
  const contextApp = React.useContext(ContextApp)

  const [src, setSrc] = React.useState()

  React.useEffect(() => {
    if (contextApp.dialogsArrayAction.exist('MediaView')) {
      setSrc(contextApp.dialogsArrayAction.props('MediaView')?.src || undefined)
    }
  }, [contextApp.dialogsArrayAction.exist('MediaView')])

  const Component =
    <Backdrop open={contextApp.dialogsArrayAction.exist('MediaView')} onClick={() => contextApp.dialogsArrayAction.remove('MediaView')} style={{ backdropFilter: 'blur(4px)', zIndex: 10000 }}>
      <div style={{ width: '100%', height: '100%', opacity: contextApp.dialogsArrayAction.exist('MediaView') ? 1 : 0, transition: '0.2s all' }}>
        {
          src ?
            <>
              <Media
                lazy
                src={src}
                controls={true}
                objectFit={'contain'}
                loadingSize={32}
                style={{ width: '100%', height: '100%' }}
              />
            </>
            : null
        }
      </div>
    </Backdrop>

  return Component
}

export default App