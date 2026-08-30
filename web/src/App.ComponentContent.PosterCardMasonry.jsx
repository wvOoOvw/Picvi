import React from 'react'

import Masonry from 'react-masonry-css'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import { Media } from './App.ComponentPure.Media'

import { emptyImage } from './utils.emptyImage'

function PosterCardMasonryItem(props) {
  const imageProps = props.imageProps
  const card = props.card
  const onClickCard = props.onClickCard
  const onEdit = props.onEdit
  const onDelete = props.onDelete

  const emptyImageMemo = React.useMemo(() => emptyImage(), [])
  const [hovered, setHovered] = React.useState(false)

  const Component =
    <Card
      style={{
        borderRadius: 16,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: hovered ? 'translateY(-6px) scale(1.02)' : undefined,
        boxShadow: hovered ? '0 12px 24px rgba(0, 0, 0, 0.2)' : undefined
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardActionArea style={{ position: 'relative' }} onClick={() => onClickCard(card)}>
        <div style={{ position: 'relative' }}>
          {
            card.poster[0] !== undefined ?
              <Media
                lazy
                src={card.poster[0]}
                loadingSize={32}
                styleMediaVisible={{ width: '100%', aspectRatio: '1 / 1' }}
                styleMediaInvisible={{ width: '100%', aspectRatio: '1 / 1' }}
                {...imageProps}
              />
              : null
          }
          {
            card.poster[0] === undefined ?
              <Media
                lazy
                src={emptyImageMemo}
                loadingSize={32}
                styleMediaVisible={{ width: '100%', aspectRatio: '1 / 1' }}
                styleMediaInvisible={{ width: '100%', aspectRatio: '1 / 1' }}
                {...imageProps}
              />
              : null
          }
          {
            card.poster[0] === undefined ? <Button variant='contained' component='div' color='inherit' style={{ minWidth: 'unset', padding: '4px 12px', fontSize: 10, opacity: 0.5, position: 'absolute', top: 8, right: 8 }}>暂无预览图</Button> : null
          }
        </div>
        <CardContent style={{ padding: '8px 16px', position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0, 0, 0, 0.25)' }}>
          <Typography variant='body2' style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', display: '-webkit-box', color: 'white' }}>{card.name}</Typography>
        </CardContent>
      </CardActionArea>
      {
        onEdit !== undefined && onDelete !== undefined ?
          <CardActions style={{ padding: '6px 8px' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button style={{ minWidth: 'unset', padding: 4 }} variant='text' color='primary' onClick={() => onDelete(card)}><DeleteIcon color='primary' style={{ width: 16, height: 16 }} /></Button>
              <Button style={{ minWidth: 'unset', padding: 4 }} variant='text' color='primary' onClick={() => onEdit(card)}><EditIcon color='primary' style={{ width: 16, height: 16 }} /></Button>
            </div>
          </CardActions>
          : null
      }
    </Card>

  return Component
}

function PosterCardMasonry(props) {
  const breakpointCols = props.breakpointCols
  const imageProps = props.imageProps
  const cards = props.cards
  const onClickCard = props.onClickCard
  const onEdit = props.onEdit
  const onDelete = props.onDelete

  const Component =
    <Masonry
      breakpointCols={breakpointCols}
      className="masonry-grid"
      columnClassName="masonry-grid_column"
      style={{ width: '100%', margin: 0 }}
    >
      {
        cards.map((card) => <PosterCardMasonryItem key={card._id} imageProps={imageProps} card={card} onClickCard={onClickCard} onEdit={onEdit} onDelete={onDelete} />)
      }
    </Masonry>

  return Component
}

export { PosterCardMasonry, PosterCardMasonryItem }
export default PosterCardMasonry