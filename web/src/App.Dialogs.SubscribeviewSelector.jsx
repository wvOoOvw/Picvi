import React from 'react'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Card from '@mui/material/Card'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ChecklistIcon from '@mui/icons-material/Checklist'

import Media from './App.ComponentPure.Media'

import { Context as ContextApp } from './App'

function App() {
  const contextApp = React.useContext(ContextApp)

  const [tempSelected, setTempSelected] = React.useState([])

  const toggleSelect = (itemId) => {
    if (tempSelected.includes(itemId)) {
      setTempSelected(prev => prev.filter(id => id !== itemId))
    } else {
      setTempSelected(prev => [...prev, itemId])
    }
  }

  const handleConfirm = () => {
    contextApp.dialogsArrayAction.props('SubscribeviewSelector').onConfirm(tempSelected)
    contextApp.dialogsArrayAction.remove('SubscribeviewSelector')
  }

  React.useEffect(() => {
    if (contextApp.dialogsArrayAction.exist('SubscribeviewSelector')) {
      setTempSelected(contextApp.dialogsArrayAction.props('SubscribeviewSelector').selectedIds || [])
    }
  }, [contextApp.dialogsArrayAction.exist('SubscribeviewSelector')])

  const subscribeview = contextApp.dialogsArrayAction.exist('SubscribeviewSelector')
    ? contextApp.dialogsArrayAction.props('SubscribeviewSelector').subscribeview
    : []

  const targetFieldName = contextApp.dialogsArrayAction.exist('SubscribeviewSelector')
    ? contextApp.dialogsArrayAction.props('SubscribeviewSelector').targetFieldName
    : ''

  const Component =
    <Dialog open={contextApp.dialogsArrayAction.exist('SubscribeviewSelector')} onClose={() => contextApp.dialogsArrayAction.remove('SubscribeviewSelector')} maxWidth="md">
      <DialogTitle>
        <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ChecklistIcon />
          从订阅内容中添加到{targetFieldName === 'poster' ? '封面' : '预览'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 8, justifyContent: 'center' }}>
          {subscribeview && subscribeview.length > 0 ? (
            subscribeview.map((mediaUrl, index) => (
              <Card
                key={index}
                sx={{
                  width: 100,
                  height: 100,
                  position: 'relative',
                  cursor: 'pointer',
                  border: tempSelected.includes(mediaUrl) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  transition: 'all 0.2s'
                }}
                onClick={() => toggleSelect(mediaUrl)}
              >
                <Media
                  src={mediaUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: tempSelected.includes(mediaUrl) ? 1 : 0.7
                  }}
                />
                {tempSelected.includes(mediaUrl) && (
                  <div style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: '#1976d2',
                    borderRadius: '50%',
                    padding: 2
                  }}>
                    <CheckCircleIcon style={{ color: 'white', fontSize: 16 }} />
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Typography variant="body2" style={{ color: '#666', marginTop: 16 }}>
              订阅内容为空，请先在"订阅内容"步骤中上传图片
            </Typography>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => contextApp.dialogsArrayAction.remove('SubscribeviewSelector')}>取消</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={tempSelected.length === 0}
        >
          确认添加 ({tempSelected.length})
        </Button>
      </DialogActions>
    </Dialog>

  return Component
}

export default App
