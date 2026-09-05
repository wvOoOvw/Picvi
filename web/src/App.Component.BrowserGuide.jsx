import React from 'react'
import { Box, Typography, Container } from '@mui/material'

export default function BrowserGuide() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: 'white',
        padding: 2
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            marginBottom: 2,
            fontWeight: 'bold',
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          请点击右上角
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            marginBottom: 3,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            opacity: 0.9
          }}
        >
          选择"在浏览器中打开"
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            fontSize: '0.9rem',
            opacity: 0.7,
            lineHeight: 1.6
          }}
        >
          为了获得更好的体验，请使用系统浏览器访问本应用
        </Typography>
      </Container>
    </Box>
  )
}