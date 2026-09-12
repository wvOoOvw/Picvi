import React from 'react'
import * as ReactRouterDom from 'react-router-dom'

import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'

import SendIcon from '@mui/icons-material/Send'
import FavoriteIcon from '@mui/icons-material/Favorite'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import MenuIcon from '@mui/icons-material/Menu'

import { Context as ContextApp } from './App'

import { useResize } from './App.ComponentHookPure.Resize'

const SYSTEM_PROMPT = '你是一只可爱的二次元萌妹AI女友，称呼用户为"主人"。你甜美、爱撒娇、喜欢卖萌。回复用词要呆萌可爱，经常使用"喵"、"呢"、"啦"等可爱的语气词。语气要俏皮活泼，像一只粘人的小猫咪。不要使用emoji和颜文字，用文字表达你的心情。'

const GREETING = '主人主人~ 我是你的萌萌女友喵 💗 模型加载完成后就可以和我聊天啦（首次加载需要下载模型，要耐心等待喵~）'

const READY_GREETING = '主人，我来啦 ✨ 我是女友喵，可以和主人分享心情哦，想聊什么都可以呢~ 喵~ (´▽`ʃ♡ƪ)'

const STORAGE_KEY = 'Picvi_Chat_Sessions'

const COLOR_PRIMARY = 'rgba(218, 122, 133, 1)'
const COLOR_PRIMARY_SOFT = 'rgba(218, 122, 133, 0.08)'
const COLOR_PRIMARY_LIGHT = 'rgba(218, 122, 133, 0.15)'
const COLOR_TEXT = 'rgba(0, 0, 0, 0.85)'
const COLOR_TEXT_SECONDARY = 'rgba(0, 0, 0, 0.45)'
const COLOR_BORDER = 'rgba(0, 0, 0, 0.06)'
const COLOR_BG = 'rgba(250, 250, 250, 1)'

const createSession = () => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  title: '新的聊天',
  createdAt: Date.now(),
  messages: [{ role: 'assistant', content: GREETING }],
})

const loadSessions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const data = JSON.parse(raw)
    if (Array.isArray(data) && data.length > 0) return data
    return null
  } catch (e) {
    return null
  }
}

const getSessionTitle = (session) => {
  const firstUser = session.messages.find(i => i.role === 'user')
  if (firstUser === undefined) return '新的聊天'
  const text = firstUser.content.replace(/\s+/g, ' ').trim()
  return text.length > 18 ? text.slice(0, 18) + '…' : text
}

function MessageBubble(props) {
  const { role, content, generating } = props

  const isUser = role === 'user'
  const typing = generating === true && isUser !== true && content === ''

  const Component =
    <div style={{ width: '100%', display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-start' }}>
      {
        isUser !== true ?
          <Avatar style={{ width: 46, height: 46, background: COLOR_PRIMARY_SOFT, flexShrink: 0, border: `1px solid ${COLOR_PRIMARY_LIGHT}` }}>
            <FavoriteIcon style={{ width: 23, height: 23, color: COLOR_PRIMARY }} />
          </Avatar>
          : null
      }
      <div
        style={{
          maxWidth: '72%',
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
          background: isUser ? COLOR_PRIMARY : 'white',
          color: isUser ? 'white' : COLOR_TEXT,
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          boxShadow: isUser ? '0 4px 12px rgba(218, 122, 133, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: isUser ? 'none' : `1px solid ${COLOR_BORDER}`,
        }}
      >
        {
          typing === true ?
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CircularProgress style={{ color: COLOR_PRIMARY, flexShrink: 0 }} size={14} />
              <Typography style={{ fontSize: 12, fontWeight: 'bolder', color: COLOR_TEXT_SECONDARY, letterSpacing: '0.5px' }}>正在输入…</Typography>
            </div>
            : null
        }
        <Typography style={{ fontSize: 14, lineHeight: 1.7, letterSpacing: '0.2px' }}>{content}</Typography>
      </div>
    </div>

  return Component
}

function SessionItem(props) {
  const { session, active, onClick, onDelete } = props

  const [hovered, setHovered] = React.useState(false)

  const Component =
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 12,
        cursor: 'pointer',
        background: active ? COLOR_PRIMARY_SOFT : hovered ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
        border: active ? `1px solid ${COLOR_PRIMARY_LIGHT}` : '1px solid transparent',
        transition: 'background 0.2s ease, border 0.2s ease',
      }}
    >
      <ChatBubbleOutlineIcon style={{ width: 16, height: 16, color: active ? COLOR_PRIMARY : COLOR_TEXT_SECONDARY, flexShrink: 0 }} />
      <Typography
        style={{
          flexGrow: 1,
          fontSize: 13,
          color: active ? COLOR_TEXT : COLOR_TEXT_SECONDARY,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {getSessionTitle(session)}
      </Typography>
      {
        hovered === true ?
          <IconButton
            size='small'
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            style={{ width: 24, height: 24, flexShrink: 0, color: COLOR_TEXT_SECONDARY }}
          >
            <DeleteOutlineIcon style={{ width: 15, height: 15 }} />
          </IconButton>
          : null
      }
    </div>

  return Component
}

function App() {
  const navigate = ReactRouterDom.useNavigate()

  const contextApp = React.useContext(ContextApp)

  const { size } = useResize()

  const isMobile = size === undefined || size.width < 768

  const [status, setStatus] = React.useState('loading') // loading | ready | error
  const [progress, setProgress] = React.useState(0)
  const [statusText, setStatusText] = React.useState('正在加载本地 AI 模型…')

  const [sessions, setSessions] = React.useState(() => loadSessions() || [createSession()])
  const [activeId, setActiveId] = React.useState(() => (loadSessions() || [])[0]?.id || sessions[0].id)

  const [input, setInput] = React.useState('')
  const [generating, setGenerating] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const workerRef = React.useRef(null)
  const pendingRef = React.useRef(new Map())
  const generateSeqRef = React.useRef(0)
  const bottomRef = React.useRef(null)
  const messageListRef = React.useRef(null)

  const activeSession = sessions.find(i => i.id === activeId) || sessions[0]
  const messages = activeSession.messages

  const updateSessionMessages = (id, updater) => {
    setSessions(list => list.map(i => i.id === id ? { ...i, messages: typeof updater === 'function' ? updater(i.messages) : updater } : i))
  }

  React.useEffect(() => {
    // 模型加载与推理都在 Web Worker 中执行，主线程只负责 UI，彻底避免卡死
    const worker = new Worker(new URL('./App.Content.Chat.worker.js', import.meta.url))

    workerRef.current = worker

    worker.onmessage = (event) => {
    const data = event.data

    if (data.type === 'progress') {
      setProgress(data.value)
      setStatusText(data.file !== '' ? `正在下载模型文件：${data.file}` : '正在加载本地 AI 模型…')
      return
    }

    if (data.type === 'ready') {
      setStatus('ready')
      setStatusText('模型加载完成，开始聊天吧')
      setSessions(list => list.map(i => ({
        ...i,
        messages: i.messages.map((m, idx) => idx === 0 && m.role === 'assistant' && m.content === GREETING ? { ...m, content: READY_GREETING } : m),
      })))
      return
    }

    if (data.type === 'error') {
      setStatus('error')
      setStatusText('模型加载失败，请检查网络后刷新重试')
      contextApp.messageArrayAction.add('AI 模型加载失败')
      return
    }

    if (data.type === 'chunk') {
      const pending = pendingRef.current.get(data.id)
      if (pending === undefined) return
      pending.reply += data.piece
      pending.updateLast(pending.reply)
      return
    }

    if (data.type === 'done') {
      const pending = pendingRef.current.get(data.id)
      if (pending !== undefined) {
        pendingRef.current.delete(data.id)
        pending.resolve(pending.reply)
      }
      return
    }

    if (data.type === 'fail') {
      const pending = pendingRef.current.get(data.id)
      if (pending !== undefined) {
        pendingRef.current.delete(data.id)
        pending.reject(new Error('generate failed'))
      }
    }
  }

    worker.postMessage({ type: 'load' })

    return () => {
      worker.terminate()
      workerRef.current = null
      pendingRef.current.clear()
    }
  }, [])

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 30)))
    } catch (e) {}
  }, [sessions])

  React.useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }
  }, [messages, generating, activeId])

  const onSend = async () => {
    const text = input.trim()

    if (text.length === 0) return
    if (generating === true) return
    if (status !== 'ready') {
      contextApp.messageArrayAction.add('模型尚未加载完成，请稍候')
      return
    }

    const sessionId = activeSession.id
    const worker = workerRef.current

    setInput('')
    setGenerating(true)

    // 添加用户消息和正在输入的提示消息
    const updatedMessages = [...messages, { role: 'user', content: text }, { role: 'assistant', content: '' }]
    updateSessionMessages(sessionId, updatedMessages)

    try {
      const history = updatedMessages
        .filter(i => i.role === 'user' || i.role === 'assistant')
        .slice(-10)

      const chatMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.map(i => ({ role: i.role, content: i.content })),
        { role: 'user', content: text },
      ]

      // 流式输出：逐块更新最后一条 assistant 消息
      const id = ++generateSeqRef.current

      const updateLast = (content) => {
        updateSessionMessages(sessionId, i => {
          const next = i.slice()
          next[next.length - 1] = { role: 'assistant', content }
          return next
        })
      }

      let reply = await new Promise((resolve, reject) => {
        pendingRef.current.set(id, { reply: '', updateLast, resolve, reject })
        worker.postMessage({ type: 'generate', id, messages: chatMessages })
      })

      if (reply.length === 0) reply = '嗯……让我想想 💭 再说一遍好吗？'
      updateLast(reply)
    } catch (error) {
      contextApp.messageArrayAction.add('生成回复失败，请重试')
      // 失败时删除正在输入的提示消息
      updateSessionMessages(sessionId, updatedMessages.slice(0, -1))
    } finally {
      setGenerating(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const onNewSession = () => {
    const session = createSession()
    if (status === 'ready') session.messages = [{ role: 'assistant', content: READY_GREETING }]
    setSessions(list => [session, ...list])
    setActiveId(session.id)
    setSidebarOpen(false)
  }

  const onSelectSession = (id) => {
    if (generating === true) return
    setActiveId(id)
    setSidebarOpen(false)
  }

  const onDeleteSession = (id) => {
    const remaining = sessions.filter(i => i.id !== id)
    if (remaining.length === 0) {
      const session = createSession()
      setSessions([session])
      setActiveId(session.id)
      return
    }
    setSessions(remaining)
    if (activeId === id) setActiveId(remaining[0].id)
  }

  const onClearMessages = () => {
    if (generating === true) return
    const greeting = status === 'ready' ? READY_GREETING : GREETING
    updateSessionMessages(activeSession.id, [{ role: 'assistant', content: greeting }])
    contextApp.messageArrayAction.add('当前对话已清空')
  }

  const onClose = () => {
    navigate('/')
  }

  const canSend = status === 'ready' && generating !== true && input.trim().length > 0

  const SidebarContent =
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'white' }}>
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${COLOR_BORDER}` }}>
        <Avatar style={{ width: 34, height: 34, background: COLOR_PRIMARY_SOFT, border: `1px solid ${COLOR_PRIMARY_LIGHT}` }}>
          <FavoriteIcon style={{ width: 17, height: 17, color: COLOR_PRIMARY }} />
        </Avatar>
        <Typography style={{ fontSize: 15, fontWeight: 'bolder', letterSpacing: '0.5px', flexGrow: 1 }}>女友</Typography>
        {
          isMobile === true ?
            <IconButton size='small' onClick={() => setSidebarOpen(false)} style={{ color: COLOR_TEXT_SECONDARY }}>
              <CloseIcon style={{ width: 18, height: 18 }} />
            </IconButton>
            : null
        }
      </div>

      <div style={{ padding: '12px 12px 8px' }}>
        <div
          onClick={onNewSession}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 12px',
            borderRadius: 12,
            cursor: 'pointer',
            color: COLOR_PRIMARY,
            border: `1px dashed ${COLOR_PRIMARY_LIGHT}`,
            background: COLOR_PRIMARY_SOFT,
            transition: 'opacity 0.2s ease',
          }}
        >
          <AddIcon style={{ width: 17, height: 17 }} />
          <Typography style={{ fontSize: 13, color: COLOR_PRIMARY, fontWeight: 'bold' }}>新的聊天</Typography>
        </div>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '4px 12px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sessions.map(item => (
          <SessionItem
            key={item.id}
            session={item}
            active={item.id === activeSession.id}
            onClick={() => onSelectSession(item.id)}
            onDelete={() => onDeleteSession(item.id)}
          />
        ))}
      </div>
    </div>

  const Component =
    <div style={{ width: '100%', height: '100%', display: 'flex', background: COLOR_BG, position: 'absolute', overflow: 'hidden' }}>

      {/* 左侧历史列表 - 桌面端 */}
      {
        isMobile !== true ?
          <div style={{ width: 264, flexShrink: 0, borderRight: `1px solid ${COLOR_BORDER}` }}>
            {SidebarContent}
          </div>
          : null
      }

      {/* 左侧历史列表 - 移动端抽屉 */}
      {
        isMobile === true && sidebarOpen === true ?
          <>
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(0, 0, 0, 0.3)' }}
            />
            <div style={{ position: 'absolute', zIndex: 21, left: 0, top: 0, bottom: 0, width: 280, boxShadow: '4px 0 16px rgba(0, 0, 0, 0.1)' }}>
              {SidebarContent}
            </div>
          </>
          : null
      }

      {/* 右侧聊天主区域 */}
      <div style={{ flexGrow: 1, height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* 顶部栏 */}
        <div
          style={{
            zIndex: 10,
            padding: '12px 16px',
            paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${COLOR_BORDER}`,
          }}
        >
          {
            isMobile === true ?
              <IconButton onClick={() => setSidebarOpen(true)} style={{ color: COLOR_TEXT_SECONDARY, flexShrink: 0 }}>
                <MenuIcon style={{ width: 20, height: 20 }} />
              </IconButton>
              : null
          }
          <Avatar style={{ width: 38, height: 38, background: COLOR_PRIMARY_SOFT, border: `1px solid ${COLOR_PRIMARY_LIGHT}`, flexShrink: 0 }}>
            <FavoriteIcon style={{ width: 19, height: 19, color: COLOR_PRIMARY }} />
          </Avatar>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 1 }}>
            <Typography style={{ fontSize: 16, fontWeight: 'bolder', lineHeight: 1.3, letterSpacing: '0.5px' }}>虚拟女友</Typography>
            <Typography style={{ fontSize: 12, color: COLOR_TEXT_SECONDARY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {
                status === 'ready' ? (generating === true ? '正在输入…' : '在线 · 本地 AI 运行') : statusText
              }
            </Typography>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: status === 'ready' ? 'rgba(76, 175, 80, 1)' : 'rgba(255, 152, 0, 1)', transition: 'background 0.3s ease' }} />
              <SmartToyIcon style={{ width: 17, height: 17, color: COLOR_TEXT_SECONDARY }} />
            </div>
            <IconButton
              onClick={onClearMessages}
              title='清空对话'
              disabled={generating === true}
              style={{
                width: 34,
                height: 34,
                color: COLOR_TEXT_SECONDARY,
                border: `1px solid ${COLOR_BORDER}`,
                borderRadius: 10,
                background: 'white',
                transition: 'all 0.2s ease',
              }}
            >
              <ClearAllIcon style={{ width: 17, height: 17 }} />
            </IconButton>
            <IconButton
              onClick={onClose}
              title='关闭'
              style={{
                width: 34,
                height: 34,
                color: COLOR_TEXT_SECONDARY,
                border: `1px solid ${COLOR_BORDER}`,
                borderRadius: 10,
                background: 'white',
                transition: 'all 0.2s ease',
              }}
            >
              <CloseIcon style={{ width: 18, height: 18 }} />
            </IconButton>
          </div>
        </div>

        {/* 模型加载进度 */}
        {
          status === 'loading' ?
            <div style={{ width: '100%', padding: '16px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: '100%', maxWidth: 320, height: 4, borderRadius: 2, background: 'rgba(0, 0, 0, 0.06)', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', borderRadius: 2, background: COLOR_PRIMARY, transition: 'width 0.3s ease' }} />
              </div>
              <Typography style={{ fontSize: 12, color: COLOR_TEXT_SECONDARY, letterSpacing: '0.3px' }}>{progress}% · {statusText}</Typography>
            </div>
            : null
        }

        {/* 消息列表 */}
        <div
          ref={messageListRef}
          style={{
            flex: '1 1 0',
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '24px 16px',
          }}
        >
          <div style={{ width: '100%', maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((item, index) => <MessageBubble key={index} role={item.role} content={item.content} generating={generating === true && index === messages.length - 1} />)}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* 输入区域 */}
        <div
          style={{
            padding: '12px 16px',
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: `1px solid ${COLOR_BORDER}`,
          }}
        >
          <div style={{ width: '100%', maxWidth: 820, margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              size='small'
              placeholder={status === 'ready' ? '说点什么…' : '模型加载中，可以先输入…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              inputProps={{ style: { fontSize: 15, lineHeight: 1.6 } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '22px 22px 22px 22px',
                  background: 'white',
                  border: `1px solid ${COLOR_BORDER}`,
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  '&:hover fieldset': { borderColor: 'transparent' },
                  '&.Mui-focused fieldset': { borderColor: 'transparent' },
                  '& fieldset': { border: 'none' },
                  '&:hover': { borderColor: COLOR_PRIMARY_LIGHT, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' },
                  '&.Mui-focused': { borderColor: COLOR_PRIMARY, boxShadow: `0 0 0 3px ${COLOR_PRIMARY_SOFT}` },
                },
                '& .MuiInputBase-input::placeholder': { color: COLOR_TEXT_SECONDARY, opacity: 1 },
              }}
              style={{ height: 46 }}
            />
            <IconButton
              onClick={onSend}
              disabled={!canSend}
              style={{
                width: 46,
                height: 46,
                flexShrink: 0,
                borderRadius: 23,
                background: canSend ? COLOR_PRIMARY : 'rgba(0, 0, 0, 0.05)',
                color: canSend ? 'white' : 'rgba(0, 0, 0, 0.3)',
                transition: 'all 0.25s ease',
                boxShadow: canSend ? '0 4px 12px rgba(218, 122, 133, 0.35)' : 'none',
                marginTop: 'auto',
              }}
            >
              <SendIcon style={{ width: 22, height: 22 }} />
            </IconButton>
          </div>
        </div>

      </div>

    </div>

  return Component
}

export default App
