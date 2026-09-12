import React from 'react'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import { Context as ContextApp } from './App'

function App() {
  const contextApp = React.useContext(ContextApp)

  const [page, setPage] = React.useState('')

  const props = contextApp.dialogsArrayAction.props('PageJump')
  const max = props?.max
  const current = props?.current

  const onConfirm = () => {
    const value = Number(page)

    if (Number.isInteger(value) === false || value < 1 || value > max) {
      contextApp.messageArrayAction.add('页码无效')
      return
    }

    props?.onConfirm?.(value)
    contextApp.dialogsArrayAction.remove('PageJump')
  }

  React.useEffect(() => {
    if (contextApp.dialogsArrayAction.exist('PageJump')) {
      setPage(current !== undefined ? String(current) : '')
    }
  }, [contextApp.dialogsArrayAction.exist('PageJump')])

  const Component =
    <Dialog open={contextApp.dialogsArrayAction.exist('PageJump')} onClose={() => contextApp.dialogsArrayAction.remove('PageJump')}>
      <DialogTitle>
        <Typography color='primary' style={{ fontSize: 20 }}>跳转至...</Typography>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Typography color='primary' style={{ fontSize: 12, opacity: 0.5 }}>页码范围：1 - {max}</Typography>
        <TextField
          fullWidth
          autoComplete='off'
          size='small'
          variant='outlined'
          type='number'
          inputProps={{ min: 1, max: max }}
          value={page}
          onChange={e => setPage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onConfirm() }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => contextApp.dialogsArrayAction.remove('PageJump')}>取消</Button>
        <Button onClick={onConfirm}>确认</Button>
      </DialogActions>
    </Dialog>

  return Component
}

export default App
