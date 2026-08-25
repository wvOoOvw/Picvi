import React from 'react'

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Switch from '@mui/material/Switch'

import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded'

import MediaAction from './App.Component.MediaAction'

import { Context as ContextApp } from './App'

export function StepName(props) {
  const value = props.value
  const setValue = props.setValue

  const Component =
    <>
      <TextField fullWidth autoComplete='off' label='名称' variant='standard' value={value.name} onChange={e => setValue({ ...value, name: e.target.value })} />
    </>

  return Component
}

export function StepDescription(props) {
  const value = props.value
  const setValue = props.setValue

  const Component =
    <>
      <TextField fullWidth multiline autoComplete='off' label='描述' variant='standard' value={value.description} onChange={e => setValue({ ...value, description: e.target.value })} />
    </>

  return Component
}

export function StepTag(props) {
  const value = props.value
  const setValue = props.setValue
  const optionTag = props.optionTag

  const contextApp = React.useContext(ContextApp)

  const [add, setAdd] = React.useState('')

  const onDelete = (tag) => {
    setValue(i => ({ ...i, tag: i.tag.filter(n => n !== tag) }))
  }

  const onAdd = () => {
    if (value.tag.includes(add)) {
      return contextApp.messageArrayAction.add('无法重复添加')
    }
    if (add === '') {
      return contextApp.messageArrayAction.add('无法添加空标签')
    }
    setValue(i => ({ ...i, tag: [...i.tag, add] }))
    setAdd('')
  }

  const Component =
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 12 }}>
        {
          value.tag.map((i, index) => {
            return <Chip
              key={index}
              variant='outlined'
              onDelete={() => onDelete(i)}
              label={<Typography variant='body2' style={{ lineHeight: 1 }}>{i}</Typography>}
            />
          })
        }
        <Chip
          sx={{ '&.Mui-focusVisible': { background: 'none' } }}
          variant='outlined'
          onDelete={() => onAdd()}
          deleteIcon={<AddCircleRoundedIcon />}
          label={<input placeholder='添加' style={{ border: 'none', outline: 'none', width: 80 }} value={add} onChange={e => setAdd(e.target.value)} />}
        />
      </div>
      <div style={{ maxWidth: '100%', display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 16 }}>
        {
          optionTag.map(i => <Button key={i.tag} style={{ flexShrink: 0, minWidth: 'unset', padding: '4px 8px', fontSize: 12 }} variant='text' onClick={() => setValue(n => ({ ...n, tag: [...n.tag, i.tag] }))}>{i.tag}</Button>)
        }
      </div>
    </div>

  return Component
}

export function StepActor(props) {
  const value = props.value
  const setValue = props.setValue
  const optionActor = props.optionActor

  const contextApp = React.useContext(ContextApp)

  const [add, setAdd] = React.useState('')

  const onDelete = (actor) => {
    setValue(i => ({ ...i, actor: i.actor.filter(n => n !== actor) }))
  }

  const onAdd = () => {
    if (value.actor.includes(add)) {
      return contextApp.messageArrayAction.add('无法重复添加')
    }
    if (add === '') {
      return contextApp.messageArrayAction.add('无法添加空标签')
    }
    setValue(i => ({ ...i, actor: [...i.actor, add] }))
    setAdd('')
  }

  const Component =
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 12 }}>
        {
          value.actor.map((i, index) => {
            return <Chip
              key={index}
              variant='outlined'
              onDelete={() => onDelete(i)}
              label={<Typography variant='body2' style={{ lineHeight: 1 }}>{i}</Typography>}
            />
          })
        }
        <Chip
          sx={{ '&.Mui-focusVisible': { background: 'none' } }}
          variant='outlined'
          onDelete={() => onAdd()}
          deleteIcon={<AddCircleRoundedIcon />}
          label={<input placeholder='添加' style={{ border: 'none', outline: 'none', width: 80 }} value={add} onChange={e => setAdd(e.target.value)} />}
        />
      </div>
      <div style={{ maxWidth: '100%', display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 16 }}>
        {
          optionActor.map(i => <Button key={i.actor} style={{ flexShrink: 0, minWidth: 'unset', padding: '4px 8px', fontSize: 12 }} variant='text' onClick={() => setValue(n => ({ ...n, actor: [...n.actor, i.actor] }))}>{i.actor}</Button>)
        }
      </div>
    </div>

  return Component
}

export function StepPoster(props) {
  const value = props.value
  const setValue = props.setValue

  const Component =
    <>
      {
        value._id !== undefined ?
          <MediaAction
            _id={value._id}
            value={value.poster}
            onChange={link => setValue(i => ({ ...i, poster: link }))}
            onChangeAppend={link => setValue(i => ({ ...i, poster: [...i.poster, link] }))}
          />
          : null
      }
      {
        value._id === undefined ?
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 12 }}>
            <Typography color='primary' variant='body2' style={{ fontSize: 14 }}>修改时添加内容</Typography>
          </div>
          : null
      }
    </>

  return Component
}

export function StepPreview(props) {
  const value = props.value
  const setValue = props.setValue

  const Component =
    <>
      {
        value._id !== undefined ?
          <MediaAction
            _id={value._id}
            value={value.preview}
            onChange={link => setValue(i => ({ ...i, preview: link }))}
            onChangeAppend={link => setValue(i => ({ ...i, preview: [...i.preview, link] }))}
          />
          : null
      }
      {
        value._id === undefined ?
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 12 }}>
            <Typography color='primary' variant='body2' style={{ fontSize: 14 }}>修改时添加内容</Typography>
          </div>
          : null
      }
    </>

  return Component
}

export function StepSubscribeview(props) {
  const value = props.value
  const setValue = props.setValue

  const Component =
    <>

      {
        value._id !== undefined ?
          <MediaAction
            _id={value._id}
            value={value.subscribeview}
            onChange={link => setValue(i => ({ ...i, subscribeview: link }))}
            onChangeAppend={link => setValue(i => ({ ...i, subscribeview: [...i.subscribeview, link] }))}
          />
          : null
      }

      {
        value._id === undefined ?
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 12 }}>
            <Typography color='primary' variant='body2' style={{ fontSize: 14 }}>修改时添加内容</Typography>
          </div>
          : null
      }

    </>


  return Component
}

export function StepSetting(props) {
  const value = props.value
  const setValue = props.setValue

  const Component =
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography color='primary' variant='body2' style={{ fontSize: 16 }}>是否上架</Typography>
          <Switch checked={value.status === 1} onChange={(e, v) => setValue(({ ...value, status: v ? 1 : 0 }))} />
        </div>
      </div>
    </>

  return Component
}
